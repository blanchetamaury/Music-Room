export interface CreateOrUpdateAlbum {  
  deezerCUID: string;
  title: string;
  cover?: string;
  coverMedium?: string;
  coverBig?: string;
  label: string;
  recordType: string;
  nbTracks: number;
  fans: number;
  duration: number;
  explicitLyrics: boolean;
  explicitContentCover: number;
  releaseDate: Date;
}