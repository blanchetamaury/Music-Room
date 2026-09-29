import { DeezerTrack } from '@/types/deezer/deezer';
import { createAllDataTrack } from '@/types/track/track';
import { createOrUpdateAllDataTrack, updatePreviewTrack } from './track';
import {
	DeezerTrackNotPlayableError,
	findTrackToDb,
	getAlbumToDeezer,
	getDeezerTrack,
	listArtist,
} from './deezerFindTrack';

const DEEZER_API = 'https://api.deezer.com';

async function getTrack(deezerId: string) {
	const [trackToDb, isFresh] = await findTrackToDb(deezerId);

	if (trackToDb != null && isFresh) return trackToDb;

	const track = await getDeezerTrack(deezerId);

	if (!track.previewUrl) {
		throw new DeezerTrackNotPlayableError(deezerId);
	}

	if (trackToDb != null) {
		return updatePreviewTrack({ album: true, artists: true }, track.previewUrl, track.deezerCUID);
	}

	const trackData: createAllDataTrack = {
		deezerCUID: track.deezerCUID,
		title: track.title,
		titleShort: track.titleShort,
		duration: track.duration,
		explicit: track.explicit,
		previewUrl: track.previewUrl,
		releaseDate: track.releaseDate,
		rank: track.rank,
		trackPosition: track.trackPosition,
		diskNumber: track.diskNumber,
		bpm: track.bpm,
		explicitContentCover: track.explicitContentCover,
		artists: [],
		albumId: null,
		album: null,
	};

	const newTrack = await listArtist(track, trackData);

	const finalTrack = await getAlbumToDeezer(track, newTrack);

	await createOrUpdateAllDataTrack({ album: true, artists: true }, finalTrack);
	return finalTrack;
}

async function searchTracks(query: string, limit = 25) {
	const res = await fetch(`${DEEZER_API}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
	if (!res.ok) throw new Error(`Deezer search ${res.status}`);

	const json = await res.json();
	if (json.error) throw new Error(`Deezer error: ${json.error.message ?? 'unknown'}`);

	const data: DeezerTrack[] = json.data ?? [];

	return data;
}

async function getChart(limit = 100) {
	const res = await fetch(`${DEEZER_API}/chart/0/tracks?limit=${limit}`);
	if (!res.ok) throw new Error(`Deezer ${res.status}`);
	const { data }: { data: any } = await res.json();
	return data;
}

interface DeezerArtistPayload {
	id: number;
	name: string;
	picture_small: string | null;
	picture_medium: string | null;
	picture_big: string | null;
	nb_fan?: number;
	nb_album?: number;
}

const mapArtist = (artist: DeezerArtistPayload) => ({
	deezerCUID: String(artist.id),
	name: artist.name,
	pictureSmall: artist.picture_small,
	pictureMedium: artist.picture_medium,
	pictureBig: artist.picture_big,
	nbFan: artist.nb_fan ?? 0,
	nbAlbum: artist.nb_album ?? 0,
});

async function fetchDeezer(path: string): Promise<any[]> {
	const res = await fetch(`${DEEZER_API}${path}`);

	if (!res.ok) throw new Error(`Deezer ${res.status} on ${path}`);

	const json = await res.json();
	if (json.error) throw new Error(`Deezer error: ${json.error.message ?? 'unknown'}`);

	return json.data ?? [];
}

async function getArtistTopTracks(deezerId: string, limit = 25) {
	return fetchDeezer(`/artist/${encodeURIComponent(deezerId)}/top?limit=${limit}`);
}

async function getArtistAlbums(deezerId: string, limit = 25) {
	return fetchDeezer(`/artist/${encodeURIComponent(deezerId)}/albums?limit=${limit}`);
}

function formatTracksResponse(tracks: any[]) {
	return tracks.map((track) => ({
		id: track.id,
		title: track.title,
		title_short: track.title_short,
		duration: track.duration,
		explicit_lyrics: track.explicit_lyrics,
		preview: track.preview,
		artist: track.artist
			? { id: track.artist.id, name: track.artist.name, picture_medium: track.artist.picture_medium }
			: null,
		album: track.album
			? {
					id: track.album.id,
					title: track.album.title,
					cover_medium: track.album.cover_medium,
					cover_big: track.album.cover_big,
				}
			: null,
	}));
}

export { getChart, getTrack, searchTracks, formatTracksResponse, getArtistTopTracks, getArtistAlbums, mapArtist };
