import { OutputArtistDeezer } from "@/types/deezer/deezer";

function mapArtist(dz: any): OutputArtistDeezer {
  return {
	deezerCUID:    String(dz.id),
	name:          dz.name,
	pictureSmall:  dz.picture_small,
	pictureMedium: dz.picture_medium,
	pictureBig:    dz.picture_big,
	nbFan:         dz.nb_fan,
	nbAlbum:       dz.nb_album,
  }
}

export { mapArtist }