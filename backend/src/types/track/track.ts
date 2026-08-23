import { CreateOrUpdateAlbum } from "../album/Album";
import { CreateOrUpdateArtist } from "../artist/Artist";

export interface createTrack {
  deezerCUID: string;
  title: string;
  titleShort?: string;
  duration: number;                      
  explicit: boolean;
  previewUrl?: string;
  releaseDate?: Date;
  rank?: number;                      
  trackPosition?: number;
  diskNumber?: number;
  bpm?: number;
  explicitContentCover: number;
  albumId?: string;
  artist: CreateOrUpdateArtist[];
  album?: CreateOrUpdateAlbum;
}