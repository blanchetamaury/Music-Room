import { createAllDataTrack } from '@/types/track/track';
import { Prisma } from '../generated/client';
import { prisma } from './prisma';

const createOrUpdateAllDataTrack = async <T extends Prisma.TrackInclude>(
	include: T,
	data: createAllDataTrack
): Promise<Prisma.TrackGetPayload<{ include: T }>> => {
	const { artists, album, albumId, deezerCUID, ...value } = data;
	let genreResponse;
	let albumResponse;
	if (album) {
		const { genre, ...albumRes } = album;
		genreResponse = genre;
		albumResponse = albumRes;
	}

	const genresConnectOrCreate = genreResponse?.deezerCUID
		? {
				where: { deezerCUID: genreResponse.deezerCUID },
				create: genreResponse,
			}
		: null;

	const result = await prisma.track.upsert({
		include: include,
		where: {
			deezerCUID: data.deezerCUID,
		},
		create: {
			...value,
			deezerCUID,
			artists: {
				connectOrCreate: artists.map((a) => ({
					where: { deezerCUID: a.deezerCUID },
					create: a,
				})),
			},
			...(albumResponse && {
				album: {
					connectOrCreate: {
						where: { deezerCUID: albumResponse.deezerCUID },
						create: {
							...albumResponse,
							...(genresConnectOrCreate && {
								genre: { connectOrCreate: genresConnectOrCreate },
							}),
						},
					},
				},
			}),
		},
		update: {
			...value,
			artists: {
				connectOrCreate: artists.map((a) => ({
					where: { deezerCUID: a.deezerCUID },
					create: a,
				})),
			},
			...(albumResponse && {
				album: {
					connectOrCreate: {
						where: { deezerCUID: albumResponse.deezerCUID },
						create: {
							...albumResponse,
							...(genresConnectOrCreate != null && {
								genre: { connectOrCreate: genresConnectOrCreate },
							}),
						},
					},
				},
			}),
		},
	});

	return result as Prisma.TrackGetPayload<{ include: T }>;
};

const updatePreviewTrack = async <T extends Prisma.TrackInclude>(
	include: T,
	preview: string,
	deezerCUID: string
): Promise<Prisma.TrackGetPayload<{ include: T }>> => {
	return prisma.track.update({
		include: include,
		where: {
			deezerCUID: deezerCUID,
		},
		data: {
			previewUrl: preview,
		},
	});
};

export { createOrUpdateAllDataTrack, updatePreviewTrack };
