import { prisma } from '../../prisma/database/prisma';
import { readRow } from './permissions';

export type DeviceControlLevel = 'OWNER' | 'DELEGATE_CONTROL';

export type DeviceControlCheck =
	{ ok: true; level: DeviceControlLevel } | { ok: false; reason: 'NOT_FOUND' | 'REVOKED' | 'FORBIDDEN' };

export const checkControlPermission = async (deviceId: string, userId: string): Promise<DeviceControlCheck> => {
	const device = await readRow(() =>
		prisma.device.findUnique({
			where: { id: deviceId },
			select: {
				ownerId: true,
				revokedAt: true,
				permissions: {
					where: {
						delegateUserId: userId,
						permission: 'CONTROL',
						OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
					},
					select: { id: true },
				},
			},
		})
	);

	return decideControlPermission(device, userId);
};

export const decideControlPermission = (
	device: { ownerId: string; revokedAt: Date | null; permissions: unknown[] } | null,
	userId: string
): DeviceControlCheck => {
	if (!device) return { ok: false, reason: 'NOT_FOUND' };
	if (device.revokedAt) return { ok: false, reason: 'REVOKED' };
	if (device.ownerId === userId) return { ok: true, level: 'OWNER' };
	if (device.permissions.length > 0) return { ok: true, level: 'DELEGATE_CONTROL' };
	return { ok: false, reason: 'FORBIDDEN' };
};

export const touchDeviceLastSeen = async (deviceId: string): Promise<void> => {
	await prisma.device.update({ where: { id: deviceId }, data: { lastSeenAt: new Date() } }).catch(() => undefined);
};
