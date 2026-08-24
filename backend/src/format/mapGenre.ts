import { OutputGenreDeezer, OutputTrackDeezer } from "@/types/deezer/deezer";

function mapGenre(dz: any): OutputGenreDeezer {
  return {
	deezerCUID:    String(dz.id),
	name:          dz.name,
	pictureSmall:  dz.picture_small,
	pictureMedium: dz.picture_medium,
	pictureBig:    dz.picture_big,
  }
}

export { mapGenre }