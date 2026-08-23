import { createTrack } from "@/types/track/track";
import { Prisma } from "../generated/client";
import { prisma } from "./prisma";

const createOrUpdateTrack = async (
	data: createTrack
): Promise<Prisma.TrackGetPayload<Prisma.TrackDefaultArgs>> => {
	const { artist, album, albumId, ...value } = data;
	return prisma.track.upsert({
		where: {
			deezerCUID: data.deezerCUID,
		},
		create: {
			...value,
			artists: {
				create: artist,
			},
			...( album && { album: {create: album} }),
		},
		update: {
			...value,
			artists: {
				connectOrCreate: artist.map((a) => ({
					where: { deezerCUID: a.deezerCUID },
					create: a,
				})),
			},
			...(album && {
				album: {
					connectOrCreate: {
						where: { deezerCUID: album.deezerCUID },
						create: album,
					},
				},
			}),
		},
	});
};

export { createOrUpdateTrack }