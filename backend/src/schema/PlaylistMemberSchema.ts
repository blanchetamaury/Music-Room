import * as z from 'zod';

export const PlaylistMemberSchema = z.object({
	playlistId: z.string().min(1),
	userId: z.string().min(1),
	role: z.enum(['OWNER', 'EDITOR', 'VIEWER']).default('EDITOR'),
});

export const AcceptPlaylistInvitationSchema = z.object({
	playlistId: z.string().min(1),
	userId: z.string().min(1).optional(),
});

export const InviteByUsernameSchema = z.object({
	playlistId: z.string().min(1),
	username: z.string().min(3).max(10),
	role: z.enum(['EDITOR', 'VIEWER']).default('EDITOR'),
});
