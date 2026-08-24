import { createAllDataTrack } from "@/types/track/track";
import { Prisma } from "../generated/client";
import { prisma } from "./prisma";

const createOrUpdateAllDataTrack = async <T extends Prisma.TrackInclude>(
    include: T,
    data: createAllDataTrack
): Promise<Prisma.TrackGetPayload<{ include: T }>> => {
    const { artist, album, albumId, deezerCUID, ...value } = data;

    let genreResponse;
    let albumResponse;
    if (album) {
        const { genre, ...albumRes } = album;
        genreResponse = genre;
        albumResponse = albumRes;
    }

    const genresConnectOrCreate = genreResponse
        ? [
                {
                    where: { deezerCUID: genreResponse.deezerCUID },
                    create: genreResponse,
                },
            ]
        : undefined;

    return prisma.track.upsert({
        include: include,
        where: {
            deezerCUID: data.deezerCUID,
        },
        create: {
            ...value,
            deezerCUID,
            artists: {
                connectOrCreate: artist.map((a) => ({
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
                                genres: {
                                    connectOrCreate: genresConnectOrCreate,
                                },
                            }),
                        },
                    },
                },
            }),
        },
        update: {
            ...value,
            artists: {
                connectOrCreate: artist.map((a) => ({
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
                                genres: {
                                    connectOrCreate: genresConnectOrCreate,
                                },
                            }),
                        },
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