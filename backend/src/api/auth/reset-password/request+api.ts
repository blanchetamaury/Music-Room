import { createCode } from '../../../../prisma/database/resetPassword';
import { ResetPasswordRequestSchema } from '../../../schema/ResetPasswordRequestSchema';
import { ResetPasswordRequest } from '../../../types/auth/ResetPasswordRequest';
import { errorHandler } from '../../../utils/error';
import { parseBody } from '../../../utils/parsing';
import { sendMail } from '../../../utils/transporter';

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const body = await parseBody<ResetPasswordRequest>(req, ResetPasswordRequestSchema);

		const randomNum = Math.floor(Math.random() * 900000) + 100000;
		await sendMail({
			to: body.mail,
			subject: '🎵🔐 Reset password to Music-Room',
			text: `The new code is : ${randomNum.toString()}`,
			html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 40px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <div style="font-size: 60px;">🎵🔐🎉</div>
              <h1 style="color: white; margin: 10px 0 0 0;">Music Room</h1>
            </div>

            <div style="padding: 30px;">
              <div style="text-align: center; font-size: 50px; margin-bottom: 20px;">
                🦄🚀🍕🎸🐙🎩🌈
              </div>

              <h2 style="color: #333; text-align: center;">Voici votre code magique ✨</h2>

              <div style="background: #f0f0f0; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #764ba2;">
                  ${randomNum.toString()}
                </span>
              </div>

              <p style="color: #555; line-height: 1.7; font-size: 14px;">
                Ce code, précieux comme une pizza 🍕 encore chaude un dimanche soir de flemme totale, expirera dans exactement 10 minutes, ce qui, ramené à l'échelle de l'univers, représente une fraction absolument négligeable du temps écoulé depuis le Big Bang, mais qui, ramené à l'échelle de votre patience à 23h47 un mardi soir, représente en réalité une éternité insupportable, comparable à celle que ressent un escargot 🐌 tentant de traverser une autoroute à quatre voies pendant les heures de pointe.
              </p>

              <div style="text-align: center; font-size: 40px; margin: 20px 0;">
                🐢💨💨💨🏁
              </div>

              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                Envoyé avec ❤️, 🍕 et beaucoup trop de café par l'équipe Music Room.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
		});
		await createCode(body.mail, randomNum.toString());

		return Response.json(
			{ success: true, message: 'If the email exists, a reset code has been sent' },
			{ status: 200 }
		);
	});
}
