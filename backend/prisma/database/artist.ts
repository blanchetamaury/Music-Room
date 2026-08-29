import { Prisma } from '../generated/client';
import { prisma } from './prisma';

const findArtist = async (deezerCUID: string): Promise<Prisma.ArtistGetPayload<Prisma.ArtistDefaultArgs> | null> => {
	return prisma.artist.findUnique({
		where: {
			deezerCUID: deezerCUID,
		},
	});
};

export { findArtist };
