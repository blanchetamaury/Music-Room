import { z } from 'zod';
import { PasswordSchema } from './PasswordSchema';

export const SignUpParametersSchema = z.object({
	mail: z.email(),
	password: PasswordSchema,
	username: z.string().min(3).max(10),
});