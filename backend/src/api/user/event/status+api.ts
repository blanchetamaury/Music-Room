import { errorHandler, ERRORS_DETAILS } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { parseBody } from '@/utils/parsing';
import { EventTrackStatusSchema } from '@/schema/MusicEventSchema';
import { canEditEvent } from '@/lib/permissions';
import { canTransitionTrackStatus, getEventTrackStatus, setTrackStatus } from '../../../../prisma/database/musicEvent';
import { publishEventChange } from '@/lib/realtimePublish';
import { z } from 'zod';

export async function PATCH(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);

		const body = await parseBody<z.infer<typeof EventTrackStatusSchema>>(req, EventTrackStatusSchema);

		if (!(await canEditEvent(body.eventId, userId))) {
			throw ERRORS_DETAILS.permission_denied();
		}

		const current = await getEventTrackStatus(body.eventId, body.trackId);
		if (!current) {
			return Response.json({ success: false, message: 'Track not found in this event' }, { status: 404 });
		}

		if (current.status === body.status) {
			return Response.json(
				{ success: true, data: { trackId: body.trackId, status: current.status } },
				{ status: 200 }
			);
		}

		if (!canTransitionTrackStatus(current.status, body.status)) {
			return Response.json(
				{
					success: false,
					message: `Cannot move a track from ${current.status} to ${body.status}`,
				},
				{ status: 409 }
			);
		}

		const updated = await setTrackStatus(body.eventId, body.trackId, body.status);
		publishEventChange(body.eventId, `track.status.${updated.status}`, userId);

		return Response.json(
			{ success: true, data: { trackId: updated.trackId, status: updated.status } },
			{ status: 200 }
		);
	});
}
