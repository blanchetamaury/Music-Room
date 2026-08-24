import { CreateOrUpdateAlbum } from "../album/Album";
import { CreateOrUpdateArtist } from "../artist/Artist";

export interface createAllDataTrack {
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
  albumId: string | null;
  artist: CreateOrUpdateArtist[];
  album: CreateOrUpdateAlbum | null;
}

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
}