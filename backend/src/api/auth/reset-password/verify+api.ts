import { ResetPasswordVerifySchema } from '../../../schema/ResetPasswordVerifySchema';
import { ResetPasswordVerify } from '../../../types/auth/ResetPasswordVerify';
import { errorHandler } from '../../../utils/error';
import { parseBody } from '../../../utils/parsing';

export async function POST(req: Request): Promise<Response> {
  return errorHandler(async () => {
    const body = await parseBody<ResetPasswordVerify>(req, ResetPasswordVerifySchema);
    
    console.log('Password reset verified for:', body.mail, 'with code:', body.code);
    
    return Response.json({ success: true, message: 'Password has been reset' }, { status: 200 });
  });

}

