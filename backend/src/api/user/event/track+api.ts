import { errorHandler } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { parseBody } from '@/utils/parsing';
import { EventTrackSchema } from '@/schema/MusicEventSchema';
import { checkEventVotingAccess } from '@/lib/permissions';
import { DuplicateSuggestionError, suggestTrack } from '../../../../prisma/database/musicEvent';
import { getTrack } from '../../../../prisma/database/deezer';
import { mapUpstreamError } from '@/utils/upstream';
import { prisma } from '../../../../prisma/database/prisma';
import { publishEventChange } from '@/lib/realtimePublish';
import { z } from 'zod';

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);

		const body = await parseBody<z.infer<typeof EventTrackSchema>>(req, EventTrackSchema);

		const access = await checkEventVotingAccess(body.eventId, userId, {
			latitude: body.latitude,
			longitude: body.longitude,
		});

		if (!access.allowed) {
			return Response.json({ success: false, message: 'Event not found' }, { status: 404 });
		}

		try {
			await getTrack(body.trackId);
		} catch (e) {
			const mapped = mapUpstreamError(e);
			if (mapped) return mapped;
			throw e;
		}

		const existing = await prisma.eventTrack.findUnique({
			where: { eventId_trackId: { eventId: body.eventId, trackId: body.trackId } },
		});

		if (existing) {
			return Response.json(
				{ success: false, message: 'This track was already suggested for this event' },
				{ status: 409 }
			);
		}

		let track;
		try {
			track = await suggestTrack(body.eventId, body.trackId, userId);
		} catch (e) {
			if (e instanceof DuplicateSuggestionError) {
				return Response.json(
					{ success: false, message: 'This track was already suggested for this event' },
					{ status: 409 }
				);
			}
			throw e;
		}

		publishEventChange(body.eventId, 'track.suggested', userId);
		return Response.json({ success: true, data: track }, { status: 201 });
	});
}
