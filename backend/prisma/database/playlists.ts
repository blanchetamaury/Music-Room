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

const getPlaylistById = async <T extends Prisma.PlaylistInclude>(
	playlistId: string,
	include: T
): Promise<Prisma.PlaylistGetPayload<{ include: T }> | null> => {
	return prisma.playlist.findUnique({
		where: { id: playlistId },
		include,
	});
};

const getPlaylists = async <T extends Prisma.PlaylistInclude>(
	userId: string,
	include: T,
	options?: { visibility?: 'PUBLIC' | 'PRIVATE'; page?: number; limit?: number }
) => {
	const where: Prisma.PlaylistWhereInput = {
		OR: [
			{ ownerId: userId },
			{ members: { some: { userId, acceptedAt: { not: null } } } },
			{ visibility: 'PUBLIC' },
		],
	};

	if (options?.visibility) {
		where.visibility = options.visibility;
	}

	const page = options?.page ?? 1;
	const limit = options?.limit ?? 20;

	const [playlists, total] = await Promise.all([
		prisma.playlist.findMany({
			where,
			include,
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { updatedAt: 'desc' },
		}),
		prisma.playlist.count({ where }),
	]);

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

		await tx.playlist.update({
			where: { id: playlistId },
			data: { version: { increment: 1 }, lastEditedBy: addedBy, updatedAt: new Date() },
		});
	});
};

const removeTrack = async (playlistId: string, trackId: string, userId: string) => {
	return runTransaction(async (tx) => {
		await tx.playlistTrack.delete({ where: { playlistId_trackId: { playlistId, trackId } } });
		await tx.playlist.update({
			where: { id: playlistId },
			data: { version: { increment: 1 }, lastEditedBy: userId, updatedAt: new Date() },
		});
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
