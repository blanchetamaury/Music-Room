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

export const DeviceControlSchema = z
	.object({
		deviceId: z.string().min(1),
		command: z.enum(['play', 'pause', 'next', 'previous', 'setQueue', 'skipTo', 'setVolume']),
		tracks: z.array(z.string().min(1)).max(200).optional(),
		trackId: z.string().min(1).optional(),
		volume: z.number().int().min(0).max(100).optional(),
	})
	.superRefine((value, ctx) => {
		if (value.command === 'setQueue' && !value.tracks) {
			ctx.addIssue({ code: 'custom', path: ['tracks'], message: 'setQueue requires tracks' });
		}
		if (value.command === 'skipTo' && !value.trackId) {
			ctx.addIssue({ code: 'custom', path: ['trackId'], message: 'skipTo requires trackId' });
		}
		if (value.command === 'setVolume' && value.volume === undefined) {
			ctx.addIssue({ code: 'custom', path: ['volume'], message: 'setVolume requires volume' });
		}
	});
