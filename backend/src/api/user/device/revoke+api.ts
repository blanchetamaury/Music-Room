import { errorHandler, ERRORS_DETAILS } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { parseBody } from '@/utils/parsing';
import { canManageDevice } from '@/lib/permissions';
import { revokeDevice } from '../../../../prisma/database/device';
import { z } from 'zod';

const RevokeDeviceSchema = z.object({ deviceId: z.string().min(1) });

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);

		const body = await parseBody<z.infer<typeof RevokeDeviceSchema>>(req, RevokeDeviceSchema);

		if (!(await canManageDevice(body.deviceId, userId))) {
			throw ERRORS_DETAILS.permission_denied();
		}

		await revokeDevice(body.deviceId, userId);

		return Response.json({ success: true }, { status: 200 });
	});
}
