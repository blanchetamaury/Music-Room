import { rateLimit } from '@/lib/apply-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { ConfirmEmailSchema } from '@/schema/ConfirmMailSchema';
import { errorHandler, ERRORS_DETAILS } from '@/utils/error';
import { parseBody } from '@/utils/parsing';
import { getVerificationByToken, markVerificationAsUsed, hashToken } from '../../../prisma/database/emailVerification';
import { setEmailVerified } from '../../../prisma/database/user';

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const limited = await rateLimit(req, RATE_LIMITS.emailVerification);
		if (limited) return limited;

		const body = await parseBody<{ token: string }>(req, ConfirmEmailSchema);

		const tokenHash = hashToken(body.token);
		const verification = await getVerificationByToken(tokenHash);

		if (!verification) {
			throw ERRORS_DETAILS.invalid_token();
		}

		if (verification.expiresAt < new Date()) {
			throw ERRORS_DETAILS.token_expired();
		}

		if (verification.usedAt) {
			throw ERRORS_DETAILS.token_already_used();
		}

		await markVerificationAsUsed(verification.id);
		await setEmailVerified(verification.userId);

		return Response.json({ success: true, message: 'Email verified successfully' }, { status: 200 });
	});
}
