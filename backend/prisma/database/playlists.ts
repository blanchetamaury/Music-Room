import { CreatePlaylist } from '@/types/playlist/Playlist';
import { Prisma } from '../generated/client';
import { prisma } from './prisma';
import { PaginationParameters } from '@/types/pagination/PaginationParameters';
import { DEFAULT_PAGINATION, paginationToPrisma } from '@/utils/pagination';

const createOrUpdatePlaylist = async (
	data: CreatePlaylist,
	ownerId: string
): Promise<Prisma.PlaylistGetPayload<Prisma.PlaylistDefaultArgs>> => {
	return prisma.playlist.upsert({
		where: {
			name_ownerId: {
				name: data.name,
				ownerId: ownerId,
			},
		},
		create: {
			...data,
			ownerId: ownerId,
		},
		update: {
			...data,
			ownerId: ownerId,
		},
	});
};

const addMusictoPlaylist = async (
	playlistId: string,
	trackId: string
): Promise<Prisma.PlaylistTrackGetPayload<Prisma.PlaylistTrackDefaultArgs>> => {
	return prisma.playlistTrack.create({
		data: {
			playlistId: playlistId,
			trackId: trackId,
		},
	});
};

const removeMusictoPlaylist = async (
	playlistId: string,
	trackId: string
): Promise<Prisma.PlaylistTrackGetPayload<Prisma.PlaylistTrackDefaultArgs>> => {
	return prisma.playlistTrack.delete({
		where: {
			playlistId_trackId: {
				playlistId: playlistId,
				trackId: trackId,
			},
		},
	});
};

const getPlaylist = async <T extends Prisma.PlaylistInclude>(
	playlistId: string,
	include: T
): Promise<Prisma.PlaylistGetPayload<{ include: T }> | null> => {
	return prisma.playlist.findFirst({
		include: include,
		where: {
			id: playlistId,
		},
	});
};

const getPlaylists = async <T extends Prisma.PlaylistInclude>(
	ownerId: string,
	include: T,
	pagination?: PaginationParameters
): Promise<Prisma.PlaylistGetPayload<{ include: T }>[]> => {
	return prisma.playlist.findMany({
		include: include,
		where: {
			OR: [
				{
					ownerId: ownerId,
				},
				{
					user: {
						some: {
							id: ownerId,
						},
					},
				},
			],
		},
		...paginationToPrisma(pagination ?? DEFAULT_PAGINATION),
	});
};

export { createOrUpdatePlaylist, addMusictoPlaylist, removeMusictoPlaylist, getPlaylists, getPlaylist };
