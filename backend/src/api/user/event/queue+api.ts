import { errorHandler } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { canReadEvent } from '@/lib/permissions';
import { getEventQueue } from '../../../../prisma/database/musicEvent';
import { getTrack } from '../../../../prisma/database/deezer';

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);

		const eventId = new URL(req.url).searchParams.get('event_id');
		if (!eventId) return Response.json({ success: false, message: 'No event ID provided' }, { status: 400 });

		if (!(await canReadEvent(eventId, userId))) {
			return Response.json({ success: false, message: 'Event not found' }, { status: 404 });
		}

		const queue = await getEventQueue(eventId);

		const tracks = await Promise.all(
			queue.map(async (entry) => {
				const track = await getTrack(entry.trackId).catch(() => null);
				return {
					trackId: entry.trackId,
					status: entry.status,
					voteCount: entry.voteCount,
					suggestedBy: entry.suggestedBy,
					createdAt: entry.createdAt,
					track,
				};
			})
		);

		return Response.json({ success: true, data: tracks }, { status: 200 });
	});
}
