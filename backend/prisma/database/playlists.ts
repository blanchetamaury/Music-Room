import { CreatePlaylist } from '@/types/playlist/Playlist';
import { Prisma } from '../generated/client';
import { prisma } from './prisma';

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
	playlistName: string,
	ownerId: string,
	trackId: string
): Promise<Prisma.PlaylistGetPayload<Prisma.PlaylistDefaultArgs>> => {
	return prisma.playlist.update({
		where: {
			name_ownerId: {
				name: playlistName,
				ownerId: ownerId,
			},
		},
		data: {
			music: {
				create: {
					trackId: trackId,
				},
			},
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

export { createOrUpdatePlaylist, addMusictoPlaylist, removeMusictoPlaylist };
