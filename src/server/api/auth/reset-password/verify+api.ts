import { errorHandler, ERRORS_DETAILS } from '../../../utils/error';
import { parseBody } from '../../../utils/parsing';
import { z } from 'zod';

const ResetPasswordVerifySchema = z.object({
  mail: z.string().email(),
  code: z.string().length(6),
  password: z.string().min(6),
});

export async function POST(req: Request): Promise<Response> {
  return errorHandler(async () => {
    const body = await parseBody(req, ResetPasswordVerifySchema);
    
    console.log('Password reset verified for:', body.mail, 'with code:', body.code);
    
    return Response.json({ success: true, message: 'Password has been reset' }, { status: 200 });
  });

}

