import { rateLimit } from '@/lib/apply-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { errorHandler } from '../../utils/error';
import { parseBody } from '../../utils/parsing';
import { ResendVerificationSchema } from '../../schema/SessionSchema';
import { getUserByMail } from '../../../prisma/database/user';
import {
	createVerification,
	deleteExpiredVerifications,
	generateToken,
	hashToken,
} from '../../../prisma/database/emailVerification';
import { sendMail } from '../../utils/transporter';
import { z } from 'zod';

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

const buildVerificationEmail = (token: string, webUrl: string) => {
	const link = `${webUrl}/verify-email?token=${encodeURIComponent(token)}`;

	return {
		text: `Please verify your email by opening this link: ${link}. This link expires in 24 hours.`,
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
              <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
              <p style="color: #555; line-height: 1.7; font-size: 14px;">
                Welcome to Music Room! Please verify your email address by clicking the button below.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                  Verify Email
                </a>
              </div>
              <p style="color: #999; font-size: 12px; text-align: center;">
                This link expires in 24 hours. If you didn't create an account, please ignore this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
	};
};

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const limited = await rateLimit(req, RATE_LIMITS.emailResend);
		if (limited) return limited;

		const body = await parseBody<z.infer<typeof ResendVerificationSchema>>(req, ResendVerificationSchema);

		await deleteExpiredVerifications();

		const existing = await getUserByMail(body.mail, {});

		const genericResponse = Response.json(
			{ success: true, message: 'If the account exists, a verification email has been sent' },
			{ status: 200 }
		);

		if (!existing) return genericResponse;
		if (existing.emailVerified) return genericResponse;

		const token = generateToken();
		await createVerification(existing.id, hashToken(token), new Date(Date.now() + VERIFICATION_TTL_MS));

		const webUrl = process.env.CLIENT_URL_WEB ?? 'http://localhost:8081';

		try {
			await sendMail({
				to: body.mail,
				subject: 'Music Room - Verify Your Email',
				...buildVerificationEmail(token, webUrl),
			});
		} catch (err) {
			console.error('Failed to send verification email', err);
		}

		return genericResponse;
	});
}
