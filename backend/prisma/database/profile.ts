import { prisma } from './prisma';
import {
	decideProfileEmail,
	decideProfileRead,
	PROFILE_FIELDS,
	PROFILE_FIELD_DEFAULTS,
	type ProfileField as ProfileFieldKey,
	type VisibilityLevel,
} from '../../src/lib/permissions';
import { withRetry } from './prisma';

export { PROFILE_FIELD_DEFAULTS as DEFAULT_VISIBILITY };
export type { ProfileFieldKey, VisibilityLevel };

export const isFollowing = async (requesterId: string, targetId: string): Promise<boolean> => {
	if (requesterId === targetId) return true;
	const follow = await withRetry(() =>
		prisma.follow.findUnique({
			where: { followerId_followingId: { followerId: requesterId, followingId: targetId } },
			select: { followerId: true },
		})
	);
	return follow !== null;
};

export const getVisibilityFor = async (ownerId: string, field: ProfileFieldKey): Promise<VisibilityLevel> => {
	const row = await withRetry(() =>
		prisma.profileVisibility.findUnique({
			where: { userId_field: { userId: ownerId, field } },
			select: { visibility: true },
		})
	);
	return (row?.visibility as VisibilityLevel | undefined) ?? PROFILE_FIELD_DEFAULTS[field];
};

export const setVisibility = async (
	ownerId: string,
	settings: Partial<Record<ProfileFieldKey, VisibilityLevel>>
): Promise<void> => {
	const entries = Object.entries(settings) as Array<[ProfileFieldKey, VisibilityLevel]>;
	for (const [field, visibility] of entries) {
		await prisma.profileVisibility.upsert({
			where: { userId_field: { userId: ownerId, field } },
			create: { userId: ownerId, field, visibility },
			update: { visibility },
		});
	}
};

export const getAllVisibilities = async (ownerId: string): Promise<Record<ProfileFieldKey, VisibilityLevel>> => {
	const rows = await withRetry(() => prisma.profileVisibility.findMany({ where: { userId: ownerId } }));
	const configured = new Map(rows.map((r) => [r.field as ProfileFieldKey, r.visibility as VisibilityLevel]));
	return Object.fromEntries(PROFILE_FIELDS.map((f) => [f, configured.get(f) ?? PROFILE_FIELD_DEFAULTS[f]])) as Record<
		ProfileFieldKey,
		VisibilityLevel
	>;
};

export interface MusicPreferenceRow {
	favoriteGenres: string[];
	favoriteArtists: string[];
	favoriteAlbums: string[];
	favoriteTracks: string[];
	updatedAt: Date;
}

const emptyPreferences = (): Omit<MusicPreferenceRow, 'updatedAt'> => ({
	favoriteGenres: [],
	favoriteArtists: [],
	favoriteAlbums: [],
	favoriteTracks: [],
});

export const getMusicPreferences = async (userId: string): Promise<MusicPreferenceRow> => {
	const row = await prisma.musicPreference.findUnique({ where: { userId } });
	return row ?? { ...emptyPreferences(), updatedAt: new Date(0) };
};

export const updateMusicPreferences = async (
	userId: string,
	data: Partial<Omit<MusicPreferenceRow, 'updatedAt'>>
): Promise<MusicPreferenceRow> => {
	const current = await getMusicPreferences(userId);
	return prisma.musicPreference.upsert({
		where: { userId },
		create: { userId, ...emptyPreferences(), ...data },
		update: data,
	});
};

export const followUser = async (followerId: string, followingId: string): Promise<void> => {
	await prisma.follow.upsert({
		where: { followerId_followingId: { followerId, followingId } },
		create: { followerId, followingId },
		update: {},
	});
};

export const unfollowUser = async (followerId: string, followingId: string): Promise<void> => {
	await prisma.follow.deleteMany({ where: { followerId, followingId } });
};

export const getFollowCounts = async (userId: string): Promise<{ followers: number; following: number }> => {
	const followers = await withRetry(() => prisma.follow.count({ where: { followingId: userId } }));
	const following = await withRetry(() => prisma.follow.count({ where: { followerId: userId } }));
	return { followers, following };
};

export const userExists = async (userId: string): Promise<boolean> => {
	const row = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
	return row !== null;
};

export interface PublicProfile {
	id: string;
	username: string;
	avatarUrl: string | null;
	createdAt: Date;
	emailVerified: boolean;
	followersCount: number;
	followingCount: number;
}

export const getProfileFor = async (
	targetId: string,
	requesterId: string
): Promise<{
	profile: PublicProfile | null;
	visible: Record<ProfileFieldKey, boolean>;
	email: string | null;
	preferences: MusicPreferenceRow | null;
}> => {
	const user = await withRetry(() =>
		prisma.user.findUnique({
			where: { id: targetId },
			select: {
				id: true,
				email: true,
				username: true,
				avatarUrl: true,
				createdAt: true,
				emailVerified: true,
			},
		})
	);

	if (!user) {
		return { profile: null, visible: {} as Record<ProfileFieldKey, boolean>, email: null, preferences: null };
	}

	const isSelf = targetId === requesterId;
	const [visibilities, following, counts] = await Promise.all([
		getAllVisibilities(targetId),
		isFollowing(requesterId, targetId),
		getFollowCounts(targetId),
	]);

	const visible = {} as Record<ProfileFieldKey, boolean>;
	for (const field of PROFILE_FIELDS) {
		visible[field] = decideProfileRead(targetId, requesterId, field, visibilities[field], following);
	}

	const preferences = visible.MUSIC_PREFERENCES ? await getMusicPreferences(targetId) : null;

	return {
		profile: {
			id: user.id,
			username: user.username,
			avatarUrl: user.avatarUrl,
			createdAt: user.createdAt,
			emailVerified: user.emailVerified,
			followersCount: counts.followers,
			followingCount: counts.following,
		},
		visible,
		// The address is a contact detail, not a taste: it needs both the basics field to be
		// readable and an established follow, so a public profile does not publish it.
		email: decideProfileEmail(targetId, requesterId, visible.PROFILE_BASICS, following) ? user.email : null,
		preferences,
	};
};
