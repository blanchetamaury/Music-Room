import * as z from 'zod';

export const ResetPasswordRequestSchema = z.object({
  mail: z.email(),
});