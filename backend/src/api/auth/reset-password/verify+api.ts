import { rateLimit } from '@/lib/apply-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { getCodeByMail, markCodeAsUsed } from '../../../../prisma/database/resetPassword';
import { existUserByMail, updateUserPassword } from '../../../../prisma/database/user';
import { ResetPasswordVerifySchema } from '../../../schema/ResetPasswordVerifySchema';
import { ResetPasswordVerify } from '../../../types/auth/ResetPasswordVerify';
import { errorHandler, ERRORS_DETAILS } from '../../../utils/error';
import { parseBody } from '../../../utils/parsing';
import { generateCodeHash } from '../../../../prisma/database/resetPassword';

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const limited = await rateLimit(req, RATE_LIMITS.passwordResetVerify);
		if (limited) return limited;

		const body = await parseBody<ResetPasswordVerify>(req, ResetPasswordVerifySchema);

		const codeRecord = await getCodeByMail(body.mail);

		if (!codeRecord) {
			throw ERRORS_DETAILS.invalid_token();
		}

		const codeHash = generateCodeHash(body.code);

		if (codeRecord.codeHash !== codeHash) {
			throw ERRORS_DETAILS.invalid_token();
		}

		if (codeRecord.expiresAt < new Date()) {
			throw ERRORS_DETAILS.token_expired();
		}

		if (codeRecord.usedAt) {
			throw ERRORS_DETAILS.token_already_used();
		}

		const userExists = await existUserByMail(body.mail);
		if (!userExists) {
			throw ERRORS_DETAILS.invalid_token();
		}

		await markCodeAsUsed(codeRecord.id);
		await updateUserPassword(body.mail, body.password);

		return Response.json({ success: true, message: 'Password has been reset' }, { status: 200 });
	});
}
