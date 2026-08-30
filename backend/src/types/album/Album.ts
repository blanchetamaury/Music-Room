import { CreateOrUpdateGenre } from '../genre/genre';

export interface CreateOrUpdateAlbum {
	deezerCUID: string;
	title: string;
	cover: string | null;
	coverMedium: string | null;
	coverBig: string | null;
	label: string;
	recordType: string;
	nbTracks: number;
	fans: number;
	duration: number;
	explicitLyrics: boolean;
	explicitContentCover: number;
	releaseDate: string;
	genre: CreateOrUpdateGenre | null;
}
