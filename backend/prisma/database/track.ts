import { createAllDataTrack } from "@/types/track/track";
import { Prisma } from "../generated/client";
import { prisma } from "./prisma";

const createOrUpdateAllDataTrack = async (
	data: createAllDataTrack
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

const updatePreviewTrack = async (
	preview: string,
	deezerCUID: string,
): Promise<Prisma.TrackGetPayload<Prisma.TrackDefaultArgs>> => {
	return prisma.track.update({
		where: {
			deezerCUID: deezerCUID,
		},
		data: {
			previewUrl: preview,
		}
	});
};

export { createOrUpdateAllDataTrack, updatePreviewTrack };
