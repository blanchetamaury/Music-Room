import { verifyCsrf } from '../../lib/csrf';
import { errorHandler, ERRORS_DETAILS } from '../../utils/error';
import { getSessionPayloadFromRequest } from '../../utils/token';
import { deleteExpiredRevocations, revokeSessionFromPayload } from '../../../prisma/database/revokedSession';

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const isValidCsrf = verifyCsrf(req);
		if (!isValidCsrf) throw ERRORS_DETAILS.permission_denied();

		const payload = await getSessionPayloadFromRequest(req);
		if (payload) {
			await revokeSessionFromPayload(payload);
			void deleteExpiredRevocations();
		}

		const headers = new Headers();
		headers.append('Set-Cookie', `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
		headers.append('Set-Cookie', 'csrf_token=; Path=/; Max-Age=0; SameSite=Strict');

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers,
		});
	});
}
