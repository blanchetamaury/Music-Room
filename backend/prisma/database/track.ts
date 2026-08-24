import { createAllDataTrack } from "@/types/track/track";
import { Prisma } from "../generated/client";
import { prisma } from "./prisma";

const createOrUpdateAllDataTrack = async <T extends Prisma.TrackInclude>(
	include: T,
	data: createAllDataTrack
): Promise<Prisma.TrackGetPayload<{ include: T }>> => {
	const { artist, album, albumId, ...value } = data;
	return prisma.track.upsert({
		include: include,
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

const updatePreviewTrack = async <T extends Prisma.TrackInclude>(
	include: T,
	preview: string,
	deezerCUID: string,
): Promise<Prisma.TrackGetPayload<{ include: T }>> => {
	return prisma.track.update({
		include: include,
		where: {
			deezerCUID: deezerCUID,
		},
		data: {
			previewUrl: preview,
		}
	});
};

export { createOrUpdateAllDataTrack, updatePreviewTrack };
