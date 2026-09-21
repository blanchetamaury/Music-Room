import * as z from 'zod';

export const CreatePlaylistSchema = z.object({
	name: z.string(),
	cover: z.string(),
	description: z.string(),
	private: z.boolean(),
});

export const AddMusicToPlaylistSchema = z.object({
	playlistId: z.string(),
	trackId: z.string(),
});
