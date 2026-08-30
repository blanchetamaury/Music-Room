export interface CreateOrUpdateArtist {
	deezerCUID: string;
	name: string;
	pictureSmall: string | null;
	pictureMedium: string | null;
	pictureBig: string | null;
	nbFan: number;
	nbAlbum: number;
}
