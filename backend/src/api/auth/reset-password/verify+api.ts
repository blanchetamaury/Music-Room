import { getCode } from '../../../../prisma/database/resetPassword';
import { existUserByMail, updateUserPassword } from '../../../../prisma/database/user';
import { ResetPasswordVerifySchema } from '../../../schema/ResetPasswordVerifySchema';
import { ResetPasswordVerify } from '../../../types/auth/ResetPasswordVerify';
import { errorHandler } from '../../../utils/error';
import { parseBody } from '../../../utils/parsing';

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const body = await parseBody<ResetPasswordVerify>(req, ResetPasswordVerifySchema);

		const value = await getCode(body.mail, body.code);
		const mail = await existUserByMail(body.mail);
		if (value?.created_at) {
			const elapsed = Date.now() - new Date(value.created_at).getTime();
			if (elapsed > 10 * 60 * 1000) {
				return Response.json({ success: false, message: 'Code expired' }, { status: 400 });
			}
		}
		if (value == null || mail == false)
			return Response.json({ success: false, message: 'Error, code or mail is not good' }, { status: 400 });
		await updateUserPassword(body.mail, body.password);
		return Response.json({ success: true, message: 'Password has been reset' }, { status: 200 });
	});
}
