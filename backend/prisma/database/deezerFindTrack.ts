import { mapAlbum } from '@/format/mapAlbum';
import { mapArtist } from '@/format/mapArtist';
import { mapGenre } from '@/format/mapGenre';
import { mapTrack } from '@/format/mapTrack';
import { OutputTrackDeezer } from '@/types/deezer/deezer';
import { createAllDataTrack } from '@/types/track/track';
import { findAlbum } from './album';
import { findArtist } from './artist';
import { findGenre } from './genre';
import { prisma } from './prisma';

const DEEZER_API = 'https://api.deezer.com';

class DeezerTrackNotFoundError extends Error {
	constructor(deezerId: string) {
		super(`Deezer track ${deezerId} does not exist`);
		this.name = 'DeezerTrackNotFoundError';
	}
}

class DeezerUpstreamError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'DeezerUpstreamError';
	}
}

class DeezerTrackNotPlayableError extends Error {
	constructor(deezerId: string) {
		super(`Deezer track ${deezerId} has no playable preview in this region`);
		this.name = 'DeezerTrackNotPlayableError';
	}
}

const findTrackToDb = async (deezerId: string) => {
	const cached = await prisma.track.findUnique({
		include: { album: true, artists: true },
		where: { deezerCUID: deezerId },
	});

	if (cached?.previewUrl) {
		const match = cached.previewUrl.match(/exp=(\d+)/);
		const exp = match ? parseInt(match[1], 10) : null;

		if (Date.now() < Number(exp)) return [cached, true];
	}
	return [cached, false];
};

const getDeezerTrack = async (deezerId: string): Promise<OutputTrackDeezer> => {
	if (!/^\d+$/.test(deezerId)) {
		throw new DeezerTrackNotFoundError(deezerId);
	}

	const res = await fetch(`${DEEZER_API}/track/${deezerId}`);

	if (res.status === 404) {
		throw new DeezerTrackNotFoundError(deezerId);
	}

	if (!res.ok) {
		throw new DeezerUpstreamError(`Deezer responded with status ${res.status}`);
	}

	const json = await res.json();
	if (json.error) {
		const type = json.error.type;
		if (type === 'dataException' || type === 'DataException' || type === 'InvalidQueryException') {
			throw new DeezerTrackNotFoundError(deezerId);
		}
		throw new DeezerUpstreamError(`Deezer error: ${json.error.message ?? 'unknown'} (${deezerId})`);
	}
	return mapTrack(json);
};

const listArtist = async (track: OutputTrackDeezer, newTrack: createAllDataTrack) => {
	for (const row of track.artist) {
		const artistToDb = await findArtist(row.deezerCUID.toString());
		if (!artistToDb) {
			const res = await fetch(`${DEEZER_API}/artist/${row.deezerCUID}`);
			if (!res.ok) throw new Error(`Deezer artist ${res.status}`);
			const artistJson = await res.json();
			if (newTrack.artists.find((e) => e.deezerCUID == artistJson.id) == undefined)
				newTrack.artists.push(mapArtist(artistJson));
		} else {
			const { id, updatedAt, createdAt, ...toPush } = artistToDb;
			if (newTrack.artists.find((e) => e.deezerCUID == toPush.deezerCUID) == undefined)
				newTrack.artists.push(toPush);
		}
	}
	return newTrack;
};

const getAlbumToDeezer = async (track: OutputTrackDeezer, newTrack: createAllDataTrack) => {
	const albumId = track.album?.deezerCUID;
	if (albumId === undefined || albumId === null) {
		newTrack.album = null;
		return newTrack;
	}

	const albumToDb = await findAlbum({ genre: true }, albumId);
	if (!albumToDb) {
		const res = await fetch(`${DEEZER_API}/album/${albumId}`);
		if (!res.ok) throw new DeezerUpstreamError(`Deezer album responded with status ${res.status}`);
		const albumJson = await res.json();
		if (albumJson.error || !albumJson.title) {
			newTrack.album = null;
			return newTrack;
		}

		let genre = null;
		if (albumJson.genre_id) {
			const genreToDb = await findGenre(String(albumJson.genre_id));
			if (!genreToDb) {
				const resGenre = await fetch(`${DEEZER_API}/genre/${albumJson.genre_id}`);
				if (resGenre.ok) {
					const GenreJson = await resGenre.json();
					genre = mapGenre(GenreJson);
				}
			} else {
				const { id, ...rest } = genreToDb;
				genre = rest;
			}
		}

		newTrack.album = mapAlbum(albumJson, genre);
	} else {
		const { id, updatedAt, genre, genreId, ...toPush } = albumToDb;
		newTrack.album = {
			genre: genre ?? null,
			...toPush,
		};
	}
	return newTrack;
};

export {
	DeezerTrackNotFoundError,
	DeezerTrackNotPlayableError,
	DeezerUpstreamError,
	findTrackToDb,
	getAlbumToDeezer,
	getDeezerTrack,
	listArtist,
};
