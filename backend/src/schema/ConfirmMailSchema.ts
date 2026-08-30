import * as z from 'zod';

export const ConfirmMailSchema = z.object({
	mail: z.email(),
	code: z.string().length(6),
});
