import { unsetSession } from '@/lib/session';
import { verifyCsrf } from '@/lib/csrf';
import { errorHandler, ERRORS_DETAILS } from '@/utils/error';

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const isValidCsrf = verifyCsrf(req);
		if (!isValidCsrf) throw ERRORS_DETAILS.permission_denied();
		await unsetSession();
		return Response.json({ success: true });
	});
}