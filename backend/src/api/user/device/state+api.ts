import { prisma } from '../../../../prisma/database/prisma';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { errorHandler, ERRORS_DETAILS } from '@/utils/error';
import { emptyPlaybackSnapshot } from '@/lib/deviceControl';

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);

		const deviceId = new URL(req.url).searchParams.get('device_id');
		if (!deviceId) throw ERRORS_DETAILS.invalid_parameter();

		const device = await prisma.device.findUnique({
			where: { id: deviceId },
			select: {
				ownerId: true,
				revokedAt: true,
				playbackState: true,
				permissions: {
					where: {
						delegateUserId: userId,
						OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
					},
					select: { permission: true },
				},
			},
		});

		if (!device) return ERRORS_DETAILS.not_found('Device');
		if (device.revokedAt) throw ERRORS_DETAILS.permission_denied();

		const isOwner = device.ownerId === userId;
		const granted = device.permissions[0]?.permission ?? null;
		if (!isOwner && !granted) throw ERRORS_DETAILS.permission_denied();

		const state = device.playbackState ?? emptyPlaybackSnapshot();

		return Response.json(
			{
				success: true,
				data: {
					deviceId,
					level: isOwner ? 'OWNER' : `DELEGATE_${granted}`,
					state,
				},
			},
			{ status: 200 }
		);
	});
}
