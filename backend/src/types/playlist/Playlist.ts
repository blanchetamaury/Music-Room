export interface CreatePlaylist {
	name: string;
	cover: string;
	description?: string;
	private: boolean;
}

export interface AddMusicToPlaylist {
	playlistId: string;
	trackId: string;
}

export interface OutputPlaylist {
	name: string;
	cover: string;
	description?: string;
	private: boolean;
	created_at: Date;
	owner: string;
}
