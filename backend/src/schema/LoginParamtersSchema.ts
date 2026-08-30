import { z } from 'zod';

export const LoginParametersSchema = z.object({
	mail: z.email().trim(),
	password: z.string().trim(),
});
