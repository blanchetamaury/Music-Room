import { errorHandler } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { getDevices } from '../../../../prisma/database/device';

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);

		const devices = await getDevices(userId);

		return Response.json(
			{
				success: true,
				data: devices.map((d) => ({
					id: d.id,
					deviceName: d.deviceName,
					platform: d.platform,
					appVersion: d.appVersion,
					lastSeenAt: d.lastSeenAt,
					permissions: d.permissions.map((p) => ({
						id: p.id,
						delegateUserId: p.delegateUserId,
						permission: p.permission,
						expiresAt: p.expiresAt,
						createdAt: p.createdAt,
					})),
				})),
			},
			{ status: 200 }
		);
	});
}
