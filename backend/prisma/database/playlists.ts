import { Prisma } from '../generated/client';
import { prisma, runTransaction } from './prisma';
import { PaginationParameters } from '@/types/pagination/PaginationParameters';
import { DEFAULT_PAGINATION, paginationToPrisma } from '@/utils/pagination';

const createPlaylist = async (data: {
	name: string;
	description?: string;
	cover?: string;
	visibility?: 'PUBLIC' | 'PRIVATE';
	editPolicy?: 'EVERYONE' | 'INVITED_ONLY';
	ownerId: string;
}) => {
	return prisma.playlist.create({
		data: {
			name: data.name,
			description: data.description,
			cover: data.cover,
			visibility: data.visibility ?? 'PUBLIC',
			editPolicy: data.editPolicy ?? 'EVERYONE',
			ownerId: data.ownerId,
			version: 1,
			members: {
				create: { userId: data.ownerId, role: 'OWNER', acceptedAt: new Date() },
			},
		},
	});
};

type PlaylistDetail = Prisma.PlaylistGetPayload<{
	include: {
		owner: true;
		members: { include: { user: true } };
		tracks: true;
	};
}>;

const getPlaylistById = async (playlistId: string): Promise<PlaylistDetail | null> => {
	const playlist = await prisma.playlist.findUnique({
		where: { id: playlistId },
		include: { tracks: true },
	});
	if (!playlist) return null;

	const [owner, members] = await Promise.all([
		prisma.user.findUnique({ where: { id: playlist.ownerId } }),
		prisma.playlistMember.findMany({ where: { playlistId }, include: { user: true } }),
	]);

	// ownerId is a required foreign key, so the owner is always there.
	return { ...playlist, owner: owner!, members };
};

type PlaylistListRow = Prisma.PlaylistGetPayload<{
	include: {
		owner: true;
		members: { include: { user: { select: { id: true; username: true; avatarUrl: true } } } };
		tracks: true;
	};
}>;

const getPlaylists = async (
	userId: string,
	options?: { visibility?: 'PUBLIC' | 'PRIVATE'; page?: number; limit?: number }
): Promise<{ playlists: PlaylistListRow[]; total: number; page: number; limit: number; totalPages: number }> => {
	const where: Prisma.PlaylistWhereInput = {
		OR: [
			{ ownerId: userId },
			{ members: { some: { userId } } },
			{ visibility: 'PUBLIC' },
		],
	};

	if (options?.visibility) {
		where.visibility = options.visibility;
	}

	const page = options?.page ?? 1;
	const limit = options?.limit ?? 20;

	const [rows, total] = await Promise.all([
		prisma.playlist.findMany({
			where,
			include: { tracks: true },
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { updatedAt: 'desc' },
		}),
		prisma.playlist.count({ where }),
	]);

	if (rows.length === 0) return { playlists: [], total, page, limit, totalPages: Math.ceil(total / limit) };

	const playlistIds = rows.map((row) => row.id);
	const ownerIds = [...new Set(rows.map((row) => row.ownerId))];

	const [owners, members] = await Promise.all([
		prisma.user.findMany({ where: { id: { in: ownerIds } } }),
		prisma.playlistMember.findMany({
			where: { playlistId: { in: playlistIds } },
			include: { user: { select: { id: true, username: true, avatarUrl: true } } },
		}),
	]);

	const ownersById = new Map(owners.map((owner) => [owner.id, owner]));

	const playlists: PlaylistListRow[] = rows.map((row) => ({
		...row,
		owner: ownersById.get(row.ownerId)!,
		members: members.filter((member) => member.playlistId === row.id),
	}));

	return { playlists, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const updatePlaylist = async (
	playlistId: string,
	userId: string,
	data: {
		name?: string;
		description?: string;
		cover?: string | null;
		visibility?: 'PUBLIC' | 'PRIVATE';
		editPolicy?: 'EVERYONE' | 'INVITED_ONLY';
		expectedVersion?: number;
	}
) => {
	const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
	if (!playlist) throw new Error('Playlist not found');

	if (data.expectedVersion !== undefined && playlist.version !== data.expectedVersion) {
		throw new Error('VERSION_CONFLICT');
	}

	return prisma.playlist.update({
		where: { id: playlistId },
		data: {
			...data,
			version: { increment: 1 },
			lastEditedBy: userId,
			updatedAt: new Date(),
		},
	});
};

const deletePlaylist = async (playlistId: string, userId: string) => {
	return prisma.playlist.delete({ where: { id: playlistId, ownerId: userId } });
};

const addTrack = async (playlistId: string, trackId: string, position: number | undefined, addedBy: string) => {
	return runTransaction(async (tx) => {
		const maxPosition = await tx.playlistTrack.findFirst({
			where: { playlistId },
			orderBy: { position: 'desc' },
			select: { position: true },
		});

		const newPosition = position ?? (maxPosition?.position ?? -1) + 1;

		await tx.playlistTrack.create({
			data: { playlistId, trackId, position: newPosition, addedBy },
		});

		const updated = await tx.playlist.update({
			where: { id: playlistId },
			data: { version: { increment: 1 }, lastEditedBy: addedBy, updatedAt: new Date() },
			select: { version: true },
		});

		return { version: updated.version };
	});
};

const removeTrack = async (playlistId: string, trackId: string, userId: string) => {
	return runTransaction(async (tx) => {
		await tx.playlistTrack.delete({ where: { playlistId_trackId: { playlistId, trackId } } });
		const updated = await tx.playlist.update({
			where: { id: playlistId },
			data: { version: { increment: 1 }, lastEditedBy: userId, updatedAt: new Date() },
			select: { version: true },
		});

		return { version: updated.version };
	});
};

const POSITION_SHIFT = 1_000_000;

const moveTrack = async (
	playlistId: string,
	trackId: string,
	newPosition: number,
	userId: string,
	expectedVersion?: number
): Promise<{ version: number; tracks: { trackId: string; position: number }[] }> => {
	return runTransaction(async (tx) => {
		const playlist = await tx.playlist.findUnique({ where: { id: playlistId } });
		if (!playlist) throw new Error('Playlist not found');
		if (expectedVersion !== undefined && playlist.version !== expectedVersion) {
			throw new Error('VERSION_CONFLICT');
		}

		const track = await tx.playlistTrack.findUnique({ where: { playlistId_trackId: { playlistId, trackId } } });
		if (!track) throw new Error('Track not found in playlist');

		const oldPosition = track.position;

		const bounds = await tx.playlistTrack.aggregate({
			where: { playlistId },
			_min: { position: true },
			_max: { position: true },
		});

		const minPos = bounds._min.position ?? 0;
		const maxPos = bounds._max.position ?? 0;

		if (newPosition < minPos) newPosition = minPos;
		if (newPosition > maxPos) newPosition = maxPos;

		if (newPosition === oldPosition) {
			const unchanged = await tx.playlistTrack.findMany({
				where: { playlistId },
				orderBy: { position: 'asc' },
				select: { trackId: true, position: true },
			});
			return { version: playlist.version, tracks: unchanged };
		}

		const claimed = await tx.playlist.updateMany({
			where: { id: playlistId, version: playlist.version },
			data: { version: { increment: 1 }, lastEditedBy: userId, updatedAt: new Date() },
		});

		if (claimed.count === 0) throw new Error('VERSION_CONFLICT');

		await tx.playlistTrack.update({
			where: { playlistId_trackId: { playlistId, trackId } },
			data: { position: minPos - POSITION_SHIFT },
		});

		const movedDown = oldPosition < newPosition;
		const lo = movedDown ? oldPosition + 1 : newPosition;
		const hi = movedDown ? newPosition : oldPosition - 1;

		await tx.playlistTrack.updateMany({
			where: { playlistId, position: { gte: lo, lte: hi } },
			data: { position: { increment: POSITION_SHIFT } },
		});

		await tx.playlistTrack.updateMany({
			where: { playlistId, position: { gte: lo + POSITION_SHIFT, lte: hi + POSITION_SHIFT } },
			data: { position: { decrement: POSITION_SHIFT + (movedDown ? 1 : -1) } },
		});

		await tx.playlistTrack.update({
			where: { playlistId_trackId: { playlistId, trackId } },
			data: { position: newPosition },
		});

		const version = playlist.version + 1;

		const tracks = await tx.playlistTrack.findMany({
			where: { playlistId },
			orderBy: { position: 'asc' },
			select: { trackId: true, position: true },
		});

		return { version, tracks };
	});
};

const addMember = async (playlistId: string, userId: string, role: 'EDITOR' | 'VIEWER' = 'EDITOR') => {
	return prisma.playlistMember.create({ data: { playlistId, userId, role } });
};

const acceptInvitation = async (playlistId: string, userId: string) => {
	return prisma.playlistMember.update({
		where: { playlistId_userId: { playlistId, userId } },
		data: { acceptedAt: new Date() },
	});
};

const removeMember = async (playlistId: string, userId: string, requesterId: string) => {
	const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
	if (!playlist) throw new Error('Playlist not found');
	if (playlist.ownerId !== requesterId) throw new Error('Only owner can remove members');

	return prisma.playlistMember.delete({ where: { playlistId_userId: { playlistId, userId } } });
};

const getMembers = async (playlistId: string) => {
	return prisma.playlistMember.findMany({
		where: { playlistId, acceptedAt: { not: null } },
		include: { user: { select: { id: true, username: true, avatarUrl: true, email: true } } },
	});
};

export {
	createPlaylist,
	getPlaylistById,
	getPlaylists,
	updatePlaylist,
	deletePlaylist,
	addTrack,
	removeTrack,
	moveTrack,
	addMember,
	acceptInvitation,
	removeMember,
	getMembers,
};
