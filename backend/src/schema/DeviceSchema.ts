import * as z from 'zod';

export const RegisterDeviceSchema = z.object({
	deviceName: z.string().min(1).max(100),
	platform: z.enum(['ios', 'android', 'web']),
	appVersion: z.string().min(1).max(30),
});

export const DeviceDelegationSchema = z.object({
	deviceId: z.string().min(1),
	delegateUserId: z.string().min(1),
	permission: z.enum(['CONTROL', 'VIEW']).default('CONTROL'),
	expiresAt: z.coerce.date().optional(),
});
