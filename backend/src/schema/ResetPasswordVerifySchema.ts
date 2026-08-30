import * as z from 'zod';

export const ResetPasswordVerifySchema = z.object({
	mail: z.email(),
	code: z.string().length(6),
	password: z.string().min(6),
});
