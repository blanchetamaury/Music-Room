import { createUser, existUserByMail } from '../../../prisma/database/user';
import { createCsrfCookie } from '../../lib/csrf';
import { createSession } from '../../lib/session';
import { createVerification, generateToken, hashToken } from '../../../prisma/database/emailVerification';
import { sendMail } from '../../utils/transporter';
import { SignUpParametersSchema } from '../../schema/SignUpParametersSchema';
import { SignUpParameters } from '../../types/auth/SignUpParameters';
import { errorHandler, ERRORS_DETAILS } from '../../utils/error';
import { parseBody } from '../../utils/parsing';

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const body = await parseBody<SignUpParameters>(req, SignUpParametersSchema);

		if (await existUserByMail(body.mail)) throw ERRORS_DETAILS.already_exist();

		const user = await createUser(body.mail, body.password, body.username);

		const token = generateToken();
		const tokenHash = hashToken(token);
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

		await createVerification(user.id, tokenHash, expiresAt);

		await sendMail({
			to: body.mail,
			subject: 'Music Room - Verify Your Email',
			text: `Please verify your email by clicking this link: ${process.env.CLIENT_URL_WEB}/verify-email?token=${token}. This link expires in 24 hours.`,
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
                <a href="${process.env.CLIENT_URL_WEB}/verify-email?token=${token}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
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
		});

		return Response.json(
			{
				success: true,
				message: 'Account created. Please check your email to verify your account.',
				email_verification_required: true,
			},
			{ status: 201 }
		);
	});
}
