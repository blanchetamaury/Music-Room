import { OutputTrackDeezer } from "@/types/deezer/deezer";

function mapTrack(dz: any): OutputTrackDeezer {
  return {
	deezerCUID:    String(dz.id),
	title:         dz.title,
	titleShort:    dz.title_short ?? null,
	duration:      Number(dz.duration),
	explicit:      Boolean(dz.explicit_lyrics),
	previewUrl:    dz.preview ?? null,
	releaseDate:   dz.release_date ? new Date(dz.release_date) : null,
	rank:          dz.rank ? Number(dz.rank) : null,
	trackPosition: dz.track_position ?? null,
	diskNumber:    dz.disk_number ?? null,
	bpm:           dz.bpm ?? null,
	explicitContentCover: dz.explicit_content_cover ?? null,

	artist: dz.contributors.map((row: any) => ({
	  deezerCUID: row.id,
	  name: row.name,
	  pictureSmall: row.picture_small,
	  pictureMedium: row.picture_medium,
	  pictureBig: row.picture_big,
	})),

	album: {
	  deezerCUID:  String(dz.album.id),
	  title:     dz.album.title,
	  coverSmall:     dz.album.cover_small ?? null,
	  CoverMedium:  dz.album.cover_medium ?? null,
	  CoverBig:  dz.album.cover_big ?? null,
	}
  }
}

export { mapTrack }