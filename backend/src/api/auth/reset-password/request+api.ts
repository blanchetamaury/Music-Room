import { createCode } from '../../../../prisma/database/resetPassword';
import { ResetPasswordRequestSchema } from '../../../schema/ResetPasswordRequestSchema';
import { ResetPasswordRequest } from '../../../types/auth/ResetPasswordRequest';
import { errorHandler } from '../../../utils/error';
import { parseBody } from '../../../utils/parsing';
import { sendMail } from '../../../utils/transporter';

export async function POST(req: Request): Promise<Response> {
  return errorHandler(async () => {
    const body = await parseBody<ResetPasswordRequest>(req, ResetPasswordRequestSchema);
    
    console.log('Password reset requested for:', body.mail);
    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    await sendMail({
      to: body.mail,
      subject: 'Reset password to Music-room',
      text: `the new code is : ${randomNum.toString()}`,
    });
    await createCode(body.mail, randomNum.toString());
    
    return Response.json({ success: true, message: 'If the email exists, a reset code has been sent' }, { status: 200 });
  });
}