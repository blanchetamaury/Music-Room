import { prisma } from './prisma';

const notExpired = (): { OR: Array<{ expiresAt: null } | { expiresAt: { gt: Date } }> } => ({
	OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
});

const registerDevice = async (data: { ownerId: string; deviceName: string; platform: string; appVersion: string }) => {
	return prisma.device.create({ data });
};

const getDevices = async (ownerId: string) => {
	return prisma.device.findMany({
		where: { ownerId, revokedAt: null },
		include: { permissions: { where: notExpired() } },
	});
};

const updateDeviceLastSeen = async (deviceId: string) => {
	return prisma.device.update({
		where: { id: deviceId },
		data: { lastSeenAt: new Date() },
	});
};

const revokeDevice = async (deviceId: string, ownerId: string) => {
	return prisma.device.update({
		where: { id: deviceId, ownerId },
		data: { revokedAt: new Date() },
	});
};

const delegateControl = async (
	deviceId: string,
	delegateUserId: string,
	permission: 'CONTROL' | 'VIEW',
	createdBy: string,
	expiresAt?: Date
) => {
	return prisma.devicePermission.upsert({
		where: { deviceId_delegateUserId: { deviceId, delegateUserId } },
		create: { deviceId, delegateUserId, permission, createdBy, expiresAt },
		update: { permission, createdBy, expiresAt },
	});
};

const revokeDelegation = async (deviceId: string, delegateUserId: string) => {
	return prisma.devicePermission.delete({
		where: { deviceId_delegateUserId: { deviceId, delegateUserId } },
	});
};

const getDevicePermission = async (deviceId: string, delegateUserId: string) => {
	return prisma.devicePermission.findFirst({
		where: { deviceId, delegateUserId, ...notExpired() },
	});
};

const checkControlPermission = async (deviceId: string, userId: string): Promise<boolean> => {
	const device = await prisma.device.findUnique({
		where: { id: deviceId },
		select: { id: true, ownerId: true, revokedAt: true },
	});
	if (!device || device.revokedAt) return false;
	if (device.ownerId === userId) return true;

	const permission = await prisma.devicePermission.findFirst({
		where: { deviceId, delegateUserId: userId, permission: 'CONTROL', ...notExpired() },
		select: { id: true },
	});
	return permission !== null;
};

export {
	registerDevice,
	getDevices,
	updateDeviceLastSeen,
	revokeDevice,
	delegateControl,
	revokeDelegation,
	getDevicePermission,
	checkControlPermission,
};
