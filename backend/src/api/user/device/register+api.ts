import { errorHandler } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { parseBody } from '@/utils/parsing';
import { RegisterDeviceSchema } from '@/schema/DeviceSchema';
import { registerDevice } from '../../../../prisma/database/device';
import { z } from 'zod';

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);

		const body = await parseBody<z.infer<typeof RegisterDeviceSchema>>(req, RegisterDeviceSchema);

		const device = await registerDevice({
			ownerId: userId,
			deviceName: body.deviceName,
			platform: body.platform,
			appVersion: body.appVersion,
		});

		return Response.json({ success: true, data: device }, { status: 201 });
	});
}
