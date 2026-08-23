import { Prisma } from "../generated/client";
import { prisma } from "./prisma";

const findAlbum = async (
	deezerCUID: string,
): Promise<Prisma.AlbumGetPayload<Prisma.AlbumDefaultArgs> | null> => {
	return prisma.album.findUnique({
		where: {
			deezerCUID: deezerCUID,
		},
	});
};

export { findAlbum }