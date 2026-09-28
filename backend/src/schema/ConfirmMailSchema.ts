import * as z from 'zod';

export const ConfirmMailSchema = z.object({
	mail: z.email(),
	code: z.string().length(6),
});

export const ConfirmEmailSchema = z.object({
	token: z.string().min(32),
});
