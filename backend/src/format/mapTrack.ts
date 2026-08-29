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

function mapSearch(dz: any): OutputTrackDeezer[] {
  return dz.map((row: any) => ({
	  deezerCUID:    String(row.id),
	  title:         row.title,
	  titleShort:    row.title_short ?? null,
	  duration:      Number(row.duration),
	  explicit:      Boolean(row.explicit_lyrics),
	  previewUrl:    row.preview ?? null,
	  releaseDate:   row.release_date ? new Date(row.release_date) : null,
	  rank:          row.rank ? Number(row.rank) : null,
	  trackPosition: row.track_position ?? null,
	  diskNumber:    row.disk_number ?? null,
	  bpm: 0,
	  explicitContentCover: row.explicit_content_cover ?? null,
  
	  artist: [{
		deezerCUID: row.artist.id,
		name: row.artist.name,
		pictureSmall: row.artist.picture_small,
		pictureMedium: row.artist.picture_medium,
		pictureBig: row.artist.picture_big,
	  }],
  
	  album: {
		deezerCUID:  String(row.album.id),
		title:     row.album.title,
		coverSmall:     row.album.cover_small ?? null,
		CoverMedium:  row.album.cover_medium ?? null,
		CoverBig:  row.album.cover_big ?? null,
	  }
  }))
}

export { mapTrack, mapSearch }