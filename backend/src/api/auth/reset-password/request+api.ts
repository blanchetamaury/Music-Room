import { ResetPasswordRequestSchema } from '../../../schema/ResetPasswordRequestSchema';
import { ResetPasswordRequest } from '../../../types/auth/ResetPasswordRequest';
import { errorHandler } from '../../../utils/error';
import { parseBody } from '../../../utils/parsing';

export async function POST(req: Request): Promise<Response> {
  return errorHandler(async () => {
    const body = await parseBody<ResetPasswordRequest>(req, ResetPasswordRequestSchema);
    
    console.log('Password reset requested for:', body.mail);
    
    return Response.json({ success: true, message: 'If the email exists, a reset code has been sent' }, { status: 200 });
  });
}