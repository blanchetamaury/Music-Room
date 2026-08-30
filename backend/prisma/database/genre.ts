import { Prisma } from '../generated/client';
import { prisma } from './prisma';

const findGenre = async (deezerCUID: string): Promise<Prisma.GenreGetPayload<Prisma.GenreDefaultArgs> | null> => {
	return prisma.genre.findUnique({
		where: {
			deezerCUID: deezerCUID,
		},
	});
};

export { findGenre };
