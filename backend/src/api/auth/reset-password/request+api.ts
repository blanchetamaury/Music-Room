import { rateLimit } from '@/lib/apply-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { createCode, deleteExpiredCodes, generateCodeHash } from '../../../../prisma/database/resetPassword';
import { ResetPasswordRequestSchema } from '../../../schema/ResetPasswordRequestSchema';
import { ResetPasswordRequest } from '../../../types/auth/ResetPasswordRequest';
import { errorHandler } from '../../../utils/error';
import { parseBody } from '../../../utils/parsing';
import { sendMail } from '../../../utils/transporter';
import { randomInt } from 'crypto';

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const limited = await rateLimit(req, RATE_LIMITS.passwordResetRequest);
		if (limited) return limited;

		const body = await parseBody<ResetPasswordRequest>(req, ResetPasswordRequestSchema);

		await deleteExpiredCodes();

		const code = randomInt(100000, 999999).toString();
		const codeHash = generateCodeHash(code);
		const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

		await sendMail({
			to: body.mail,
			subject: 'Music Room - Password Reset Code',
			text: `Your password reset code is: ${code}. This code expires in 10 minutes.`,
			html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 40px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Music Room</h1>
            </div>
            <div style="padding: 30px;">
              <h2 style="color: #333; text-align: center;">Password Reset Code</h2>
              <div style="background: #f0f0f0; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #764ba2;">
                  ${code}
                </span>
              </div>
              <p style="color: #555; line-height: 1.7; font-size: 14px;">
                This code will expire in 10 minutes. If you did not request a password reset, please ignore this email.
              </p>
              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                Sent by the Music Room team.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
		});

		await createCode(body.mail, codeHash, expiresAt);

		return Response.json(
			{ success: true, message: 'If the email exists, a reset code has been sent' },
			{ status: 200 }
		);
	});
}
