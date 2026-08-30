export interface Track {
	id: string;
	deezerCUID: string;
	title: string;
	titleShort: string | null;
	duration: number;
	explicit: boolean;
	previewUrl: string | null;
	releaseDate: Date | null;
	rank: number | null;
	trackPosition: number | null;
	diskNumber: number | null;
	bpm: number | null;
	explicitContentCover: number;
	albumId: string | null;
	artists: Artist[];
	album: Album | null;
}

export interface Artist {
	id: string;
	deezerCUID: string;
	name: string;
	pictureSmall: string | null;
	pictureMedium: string | null;
	pictureBig: string | null;
	nbFan: number;
	nbAlbum: number;
}

export interface Album {
	id: string;
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
	releaseDate: Date;
	genreId: string;
}
