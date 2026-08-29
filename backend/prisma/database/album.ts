import { Prisma } from '../generated/client';
import { prisma } from './prisma';

const findAlbum = async <T extends Prisma.AlbumInclude>(
	include: T,
	deezerCUID: string
): Promise<Prisma.AlbumGetPayload<{ include: T }> | null> => {
	return prisma.album.findUnique({
		include: include,
		where: {
			deezerCUID: deezerCUID,
		},
	});
};

export { findAlbum };
