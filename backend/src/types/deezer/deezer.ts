export interface DeezerTrack {
  id: string | number;
  title: string;
  title_short?: string;
  duration: string | number;
  explicit_lyrics?: boolean;
  explicit_content_cover: number;
  preview?: string;
  release_date?: string;
  rank?: string | number;
  track_position?: number;
  disk_number?: number;
  npm: number;
  contributors: Contributors[];
  album: Album;
}

interface Contributors {
	id: string | number;
	name: string;
	picture_small?: string;
	picture_medium?: string; 
	picture_big?: string; 
}

interface Album {
	id: string | number;
    title: string;
	cover_small?: string;
    cover_medium?: string;
    cover_big?: string;
}

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

    artist: [{
      deezerCUID: number;
      name: string;
      pictureSmall: string;
      pictureMedium: string;
      pictureBig: string;
    }];

    album: {
      deezerCUID: string;
      title: string;
      coverSmall: string | null;
      CoverMedium: string | null;
      CoverBig: string;
    }
}

export interface OutputArtistDeezer {
    deezerCUID: string;
    name: string;
	pictureSmall: string;
    pictureMedium: string;
    pictureBig: string;
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
  genre: OutputGenreDeezer | null;
}

export interface OutputGenreDeezer {
    deezerCUID: string;
    name: string;
	pictureSmall: string | null;
    pictureMedium: string | null;
    pictureBig: string | null;
}