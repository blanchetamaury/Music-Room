import { errorHandler, ERRORS_DETAILS } from '../../../utils/error';
import { parseBody } from '../../../utils/parsing';
import { z } from 'zod';

const ResetPasswordRequestSchema = z.object({
  mail: z.string().email(),
});

export async function POST(req: Request): Promise<Response> {
  return errorHandler(async () => {
    const body = await parseBody(req, ResetPasswordRequestSchema);
    
    console.log('Password reset requested for:', body.mail);
    
    return Response.json({ success: true, message: 'If the email exists, a reset code has been sent' }, { status: 200 });
  });
}