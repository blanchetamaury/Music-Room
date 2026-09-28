export interface OutputTrackDeezer {
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
	explicitContentCover: number | null;

	artist: [
		{
			deezerCUID: number;
			name: string;
			pictureSmall: string;
			pictureMedium: string;
			pictureBig: string;
		},
	];

	album: {
		deezerCUID: string;
		title: string;
		coverSmall: string | null;
		CoverMedium: string | null;
		CoverBig: string | null;
	};
}

export interface OutputArtistDeezer {
	deezerCUID: string;
	name: string;
	pictureSmall: string | null;
	pictureMedium: string | null;
	pictureBig: string | null;
	nbFan: number;
	nbAlbum: number;
}

export interface OutputAlbumDeezer {
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
	genre: { deezerCUID: string; name: string } | null;
}
