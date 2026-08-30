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
	explicitContentCover: number;

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
		CoverBig: string;
	};
}
