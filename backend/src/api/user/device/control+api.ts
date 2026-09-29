import { checkControlPermission, touchDeviceLastSeen } from '@/lib/deviceControlPermission';
import { applyPlaybackCommand, emptyPlaybackSnapshot, PlaybackCommandError } from '@/lib/deviceControl';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { parseBody } from '@/utils/parsing';
import { errorHandler, ERRORS_DETAILS } from '@/utils/error';
import { DeviceControlSchema } from '@/schema/DeviceSchema';
import { prisma } from '../../../../prisma/database/prisma';
import { publishDeviceChange } from '@/lib/realtimePublish';
import { z } from 'zod';

const toSnapshot = (row: {
	status: 'IDLE' | 'PLAYING' | 'PAUSED';
	queue: string[];
	history: string[];
	currentTrackId: string | null;
	positionMs: number;
	volume: number;
}) => ({
	status: row.status,
	queue: row.queue,
	history: row.history,
	currentTrackId: row.currentTrackId,
	positionMs: row.positionMs,
	volume: row.volume,
});

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);

		const body = await parseBody<z.infer<typeof DeviceControlSchema>>(req, DeviceControlSchema);

		const check = await checkControlPermission(body.deviceId, userId);
		if (!check.ok) {
			if (check.reason === 'NOT_FOUND') return ERRORS_DETAILS.not_found('Device');
			throw ERRORS_DETAILS.permission_denied();
		}

		const current = await prisma.devicePlaybackState.findUnique({ where: { deviceId: body.deviceId } });
		const before = current ? toSnapshot(current) : emptyPlaybackSnapshot();

		let after;
		try {
			after = applyPlaybackCommand(before, {
				command: body.command,
				tracks: body.tracks,
				trackId: body.trackId,
				volume: body.volume,
			});
		} catch (error) {
			if (error instanceof PlaybackCommandError) throw ERRORS_DETAILS.invalid_parameter();
			throw error;
		}
		const saved = await prisma.devicePlaybackState.upsert({
			where: { deviceId: body.deviceId },
			create: {
				deviceId: body.deviceId,
				status: after.status,
				queue: after.queue,
				history: after.history,
				currentTrackId: after.currentTrackId,
				positionMs: after.positionMs,
				volume: after.volume,
				updatedBy: userId,
			},
			update: {
				status: after.status,
				queue: after.queue,
				history: after.history,
				currentTrackId: after.currentTrackId,
				positionMs: after.positionMs,
				volume: after.volume,
				updatedBy: userId,
			},
		});

		await touchDeviceLastSeen(body.deviceId);
		publishDeviceChange(body.deviceId, `device.command.${body.command}`, userId);

		return Response.json(
			{
				success: true,
				data: {
					deviceId: body.deviceId,
					level: check.level,
					state: toSnapshot(saved),
				},
			},
			{ status: 200 }
		);
	});
}
