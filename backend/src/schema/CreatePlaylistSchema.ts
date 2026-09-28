import * as z from 'zod';

export const CreatePlaylistSchema = z.object({
	name: z.string().min(1).max(100),
	cover: z.string().url().optional().nullable(),
	description: z.string().max(500).optional(),
	visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
	editPolicy: z.enum(['EVERYONE', 'INVITED_ONLY']).default('EVERYONE'),
});

export const AddMusicToPlaylistSchema = z.object({
	playlistId: z.string().min(1),
	trackId: z.string().min(1),
	position: z.number().int().optional(),
});

export const UpdatePlaylistSchema = z.object({
	playlistId: z.string().min(1),
	name: z.string().trim().min(1).max(100).optional(),
	cover: z.string().url().optional().nullable(),
	description: z.string().max(500).optional(),
	visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
	editPolicy: z.enum(['EVERYONE', 'INVITED_ONLY']).optional(),
	expectedVersion: z.number().int().optional(),
});

export const RemoveMusicFromPlaylistSchema = z.object({
	playlistId: z.string().min(1),
	trackId: z.string().min(1),
});

export const MoveTrackSchema = z.object({
	playlistId: z.string().min(1),
	trackId: z.string().min(1),
	newPosition: z.number().int(),
	expectedVersion: z.number().int().optional(),
});
