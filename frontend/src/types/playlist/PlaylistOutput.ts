import { Album } from '../track/track';

export interface PlaylistOutput {
	name: string;
	cover: string;
	description: string;
	private: boolean;
	id: string;
	ownerId: string;
	user: {
		id: string;
		username: string;
		avatarUrl: string;
	}[];
	music: {
		id: string;
		position: number;
		added_at: Date;
		trackId: string;
		track: Track;
	}[];
}

interface Track {
	id: string;
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
	album: Album;
}
