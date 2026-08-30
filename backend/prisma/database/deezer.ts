import { DeezerTrack } from '@/types/deezer/deezer';
import { createAllDataTrack } from '@/types/track/track';
import { createOrUpdateAllDataTrack, updatePreviewTrack } from './track';
import { findTrackToDb, getAlbumToDeezer, getDeezerTrack, listArtist } from './deezerFindTrack';

const DEEZER_API = 'https://api.deezer.com';

async function getTrack(deezerId: string) {
	const [trackToDb, checkToDb] = await findTrackToDb(deezerId);
	if (trackToDb != null) return trackToDb;

	const track = await getDeezerTrack(deezerId);

	if (checkToDb == true) {
		return updatePreviewTrack({ album: true, artists: true }, track.previewUrl!, track.deezerCUID);
	} else {
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

export { getChart, getTrack, searchTracks };
