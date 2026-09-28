import * as z from 'zod';

export const UpdateUserSchema = z.object({
	username: z.string().trim().min(2).max(40).optional(),
	avatarUrl: z.union([z.string().url(), z.literal(''), z.null()]).optional(),
});
