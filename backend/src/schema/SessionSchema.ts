import * as z from 'zod';

export const SessionExchangeSchema = z.object({
	code: z.string().min(32),
});

export const ResendVerificationSchema = z.object({
	mail: z.email(),
});
