export interface CreatePlaylist {
	name: string;
	cover?: string | null;
	description?: string;
	visibility?: 'PUBLIC' | 'PRIVATE';
	editPolicy?: 'EVERYONE' | 'INVITED_ONLY';
}

export interface AddMusicToPlaylist {
	playlistId: string;
	trackId: string;
	position?: number;
}

export interface UpdatePlaylist {
	playlistId: string;
	name?: string;
	cover?: string | null;
	description?: string;
	visibility?: 'PUBLIC' | 'PRIVATE';
	editPolicy?: 'EVERYONE' | 'INVITED_ONLY';
	expectedVersion?: number;
}

export interface OutputPlaylist {
	name: string;
	cover: string;
	description?: string;
	visibility: 'PUBLIC' | 'PRIVATE';
	editPolicy: 'EVERYONE' | 'INVITED_ONLY';
	version: number;
	created_at: Date;
	owner: string;
}
