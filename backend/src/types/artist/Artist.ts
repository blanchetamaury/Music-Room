export interface CreateOrUpdateArtist {	
	deezerCUID: string;
	name: string;
	pictureSmall?: string;
	pictureMedium?: string;
	pictureBig?: string;
	nbFan: number;
	nbAlbum: number;
}