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
	}[];
}
