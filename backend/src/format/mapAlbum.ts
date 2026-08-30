import { OutputAlbumDeezer, OutputGenreDeezer } from '@/types/deezer/deezer';

function mapAlbum(dz: any, genre: OutputGenreDeezer | null): OutputAlbumDeezer {
	return {
		deezerCUID: String(dz.id),
		title: dz.title,
		cover: dz.cover_small,
		coverMedium: dz.cover_medium,
		coverBig: dz.cover_big,
		label: dz.label,
		recordType: dz.record_type,
		nbTracks: dz.nb_tracks,
		fans: dz.fans,
		duration: dz.duration,
		explicitLyrics: dz.explicit_lyrics,
		explicitContentCover: dz.explicit_content_cover,
		releaseDate: dz.release_date,
		genre: genre,
	};
}

export { mapAlbum };
