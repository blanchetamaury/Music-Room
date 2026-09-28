import { outputAPIAlbum } from '../album/album';

export interface Like {
	userId: string;
	trackId: string;
	createdAt: Date;
	track: track;
}

export interface track {
	id: string;
	deezerCUID: string;
	title: string;
	duration: number;
	explicitContentCover: number;
	releaseDate: Date | null;
	updatedAt: Date;
	titleShort: string | null;
	explicit: boolean;
	previewUrl: string | null;
	rank: number | null;
	trackPosition: number | null;
	diskNumber: number | null;
	bpm: number | null;
	albumId: string | null;
	album: outputAPIAlbum;
}
