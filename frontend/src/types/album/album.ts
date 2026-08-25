export interface outputAPIAlbum {
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
	tracks: outputAPITrack[];
}

export interface outputAPITrack {
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
}
