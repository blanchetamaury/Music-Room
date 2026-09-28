import { errorHandler, ERRORS_DETAILS } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { parseBody } from '@/utils/parsing';
import { DeviceDelegationSchema } from '@/schema/DeviceSchema';
import { canManageDevice } from '@/lib/permissions';
import { delegateControl, revokeDelegation } from '../../../../prisma/database/device';
import { prisma } from '../../../../prisma/database/prisma';
import { publishDeviceChange } from '@/lib/realtimePublish';
import { isUniqueViolation } from '@/utils/prisma';
import { z } from 'zod';

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);

		const body = await parseBody<z.infer<typeof DeviceDelegationSchema>>(req, DeviceDelegationSchema);

		if (!(await canManageDevice(body.deviceId, userId))) {
			throw ERRORS_DETAILS.permission_denied();
		}

		if (body.delegateUserId === userId) throw ERRORS_DETAILS.invalid_parameter();

		const delegate = await prisma.user.findUnique({ where: { id: body.delegateUserId }, select: { id: true } });
		if (!delegate) throw ERRORS_DETAILS.invalid_parameter();

		if (body.expiresAt && body.expiresAt <= new Date()) throw ERRORS_DETAILS.invalid_parameter();

		let permission: Awaited<ReturnType<typeof delegateControl>>;
		try {
			permission = await delegateControl(
				body.deviceId,
				body.delegateUserId,
				body.permission,
				userId,
				body.expiresAt
			);
		} catch (e) {
			if (isUniqueViolation(e)) throw ERRORS_DETAILS.already_exist();
			throw e;
		}

		publishDeviceChange(body.deviceId, 'device.delegated', userId);

		return Response.json({ success: true, data: permission }, { status: 201 });
	});
}

export async function DELETE(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);

		const body = await parseBody<z.infer<typeof DeviceDelegationSchema>>(req, DeviceDelegationSchema);

		if (!(await canManageDevice(body.deviceId, userId))) {
			throw ERRORS_DETAILS.permission_denied();
		}

		const existing = await prisma.devicePermission.findUnique({
			where: { deviceId_delegateUserId: { deviceId: body.deviceId, delegateUserId: body.delegateUserId } },
		});

		if (!existing) return Response.json({ success: false, message: 'Delegation not found' }, { status: 404 });

		await revokeDelegation(body.deviceId, body.delegateUserId);

		publishDeviceChange(body.deviceId, 'device.delegation_revoked', userId);

		return Response.json({ success: true }, { status: 200 });
	});
}
