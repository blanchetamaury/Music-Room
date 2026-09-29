import { prisma } from '../../prisma/database/prisma';
import { evaluateTimeWindow, haversineDistanceMeters, isValidGeoPoint, type GeoPoint } from './geo';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const readRow = async <T>(read: () => Promise<T | null>): Promise<T | null> => {
	const first = await read();
	if (first !== null && first !== undefined) return first;

	await sleep(20);
	const second = await read();
	return second ?? null;
};

export { readRow };

export interface PlaylistAuthRow {
	visibility: 'PUBLIC' | 'PRIVATE';
	ownerId: string;
	editPolicy: 'EVERYONE' | 'INVITED_ONLY';
	members: Array<{ role: 'OWNER' | 'EDITOR' | 'VIEWER' }>;
}

export const decidePlaylistRead = (playlist: PlaylistAuthRow, userId: string): boolean => {
	if (playlist.ownerId === userId) return true;
	if (playlist.visibility === 'PUBLIC') return true;
	return playlist.members.length > 0;
};

export const decidePlaylistEdit = (playlist: PlaylistAuthRow, userId: string): boolean => {
	if (playlist.ownerId === userId) return true;

	const member = playlist.members[0];
	if (member?.role === 'EDITOR' || member?.role === 'OWNER') return true;

	if (playlist.editPolicy !== 'EVERYONE') return false;
	if (playlist.visibility === 'PUBLIC') return true;

	return member !== undefined;
};

const readPlaylistAuthRow = (playlistId: string, userId: string, acceptedOnly = false) =>
	readRow(() =>
		prisma.playlist.findUnique({
			where: { id: playlistId },
			select: {
				visibility: true,
				ownerId: true,
				editPolicy: true,
				members: { where: acceptedOnly ? { userId, acceptedAt: { not: null } } : { userId } },
			},
		})
	);

export async function canReadPlaylist(playlistId: string, userId: string): Promise<boolean> {
	const playlist = await readPlaylistAuthRow(playlistId, userId);
	if (!playlist) return false;
	return decidePlaylistRead(playlist, userId);
}

export async function canEditPlaylist(playlistId: string, userId: string): Promise<boolean> {
	const playlist = await readPlaylistAuthRow(playlistId, userId, true);
	if (!playlist) return false;
	return decidePlaylistEdit(playlist, userId);
}

export const decideEventRead = (
	event: { ownerId: string; visibility: string; members: unknown[] },
	userId: string
): boolean => {
	if (event.ownerId === userId) return true;
	if (event.visibility === 'PUBLIC') return true;
	return event.members.length > 0;
};

export async function canReadEvent(eventId: string, userId: string): Promise<boolean> {
	const event = await readRow(() =>
		prisma.musicEvent.findUnique({
			where: { id: eventId },
			select: {
				visibility: true,
				ownerId: true,
				votingPolicy: true,
				members: { where: { userId } },
			},
		})
	);

	if (!event) return false;
	return decideEventRead(event, userId);
}

export type VotingDenialReason =
	'EVENT_NOT_FOUND' | 'NOT_A_MEMBER' | 'INVALID_LOCATION' | 'LOCATION_OUT_OF_RADIUS' | 'OUTSIDE_TIME_WINDOW';

export type VotingAccess =
	{ allowed: true } | { allowed: false; reason: VotingDenialReason; distanceMeters?: number; radiusMeters?: number };

export interface EventVotingAuthRow {
	ownerId: string;
	votingPolicy: 'EVERYONE' | 'INVITED_ONLY' | 'LOCATION_TIME';
	latitude: number | null;
	longitude: number | null;
	radius: number | null;
	startAt: Date | null;
	endAt: Date | null;
	members: Array<{ userId: string }>;
}

const deny = (reason: VotingDenialReason): VotingAccess => ({ allowed: false, reason });

export const decideEventVotingAccess = (
	event: EventVotingAuthRow,
	userId: string,
	position: Partial<GeoPoint> | null | undefined
): VotingAccess => {
	if (event.votingPolicy === 'EVERYONE') return { allowed: true };

	const isMember = event.ownerId === userId || event.members.length > 0;

	if (event.votingPolicy === 'INVITED_ONLY') {
		return isMember ? { allowed: true } : deny('NOT_A_MEMBER');
	}

	if (!isMember) return deny('NOT_A_MEMBER');

	if (event.latitude === null || event.longitude === null || event.radius === null) {
		return deny('LOCATION_OUT_OF_RADIUS');
	}

	const timeState = evaluateTimeWindow({ startAt: event.startAt, endAt: event.endAt });
	if (timeState === 'NOT_STARTED' || timeState === 'NOT_ENDED') {
		return deny('OUTSIDE_TIME_WINDOW');
	}

	if (!isValidGeoPoint(position)) return deny('INVALID_LOCATION');

	const distanceMeters = haversineDistanceMeters(
		{ latitude: position.latitude!, longitude: position.longitude! },
		{ latitude: event.latitude, longitude: event.longitude }
	);

	if (distanceMeters > event.radius) {
		return { allowed: false, reason: 'LOCATION_OUT_OF_RADIUS', distanceMeters, radiusMeters: event.radius };
	}

	return { allowed: true };
};

export async function checkEventVotingAccess(
	eventId: string,
	userId: string,
	position: Partial<GeoPoint> | null | undefined
): Promise<VotingAccess> {
	const event = await readRow(() =>
		prisma.musicEvent.findUnique({
			where: { id: eventId },
			select: {
				ownerId: true,
				votingPolicy: true,
				latitude: true,
				longitude: true,
				radius: true,
				startAt: true,
				endAt: true,
				members: { where: { userId, acceptedAt: { not: null } } },
			},
		})
	);

	if (!event) return deny('EVENT_NOT_FOUND');
	return decideEventVotingAccess(event, userId, position);
}

export async function canVoteEvent(
	eventId: string,
	userId: string,
	position?: Partial<GeoPoint> | null
): Promise<boolean> {
	return (await checkEventVotingAccess(eventId, userId, position)).allowed;
}

export const decideEventEdit = (event: { ownerId: string; members: unknown[] }, userId: string): boolean => {
	if (event.ownerId === userId) return true;
	return event.members.length > 0;
};

export async function canEditEvent(eventId: string, userId: string): Promise<boolean> {
	const event = await readRow(() =>
		prisma.musicEvent.findUnique({
			where: { id: eventId },
			select: {
				ownerId: true,
				members: { where: { userId, role: { in: ['OWNER', 'ADMIN'] }, acceptedAt: { not: null } } },
			},
		})
	);

	if (!event) return false;
	return decideEventEdit(event, userId);
}

export const decideDeviceManage = (
	device: { ownerId: string; revokedAt: Date | null } | null,
	userId: string
): boolean => {
	if (!device || device.revokedAt) return false;
	return device.ownerId === userId;
};

export async function canManageDevice(deviceId: string, userId: string): Promise<boolean> {
	const device = await readRow(() =>
		prisma.device.findUnique({
			where: { id: deviceId },
			select: { ownerId: true, revokedAt: true },
		})
	);

	return decideDeviceManage(device, userId);
}

export type VisibilityLevel = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';

export type ProfileField = 'PROFILE_BASICS' | 'MUSIC_PREFERENCES' | 'LIKES' | 'PLAYLISTS' | 'PLAY_HISTORY';

export const PROFILE_FIELD_DEFAULTS: Record<ProfileField, VisibilityLevel> = {
	PROFILE_BASICS: 'PUBLIC',
	MUSIC_PREFERENCES: 'PUBLIC',
	LIKES: 'FRIENDS',
	PLAYLISTS: 'PUBLIC',
	PLAY_HISTORY: 'PRIVATE',
};

export const PROFILE_FIELDS = Object.keys(PROFILE_FIELD_DEFAULTS) as ProfileField[];

export const decideProfileRead = (
	ownerId: string,
	requesterId: string,
	field: ProfileField,
	visibility: VisibilityLevel,
	isFollowing: boolean
): boolean => {
	if (ownerId === requesterId) return true;
	if (visibility === 'PUBLIC') return true;
	if (visibility === 'PRIVATE') return false;
	return isFollowing;
};

export const decideProfileEmail = (
	ownerId: string,
	requesterId: string,
	basicsVisible: boolean,
	isFollowing: boolean
): boolean => {
	if (ownerId === requesterId) return true;
	if (!basicsVisible) return false;
	return isFollowing;
};
