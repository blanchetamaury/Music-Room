export interface CreatePlaylist {
	name: string;
	ownerId: string;
	cover: string;
	description?: string;
	private: boolean;
}

export interface OutputPlaylist {
	name: string;
	cover: string;
	description?: string;
	private: boolean;
	created_at: Date;
	owner: string;
}