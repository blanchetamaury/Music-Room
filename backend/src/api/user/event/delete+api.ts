import { errorHandler, ERRORS_DETAILS } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { prisma } from '../../../../prisma/database/prisma';
import { publishEventChange } from '@/lib/realtimePublish';

export async function DELETE(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);

		const eventId = new URL(req.url).searchParams.get('event_id');
		if (!eventId) return Response.json({ success: false, message: 'No event ID provided' }, { status: 400 });

		const event = await prisma.musicEvent.findUnique({
			where: { id: eventId },
			select: { ownerId: true },
		});
		if (!event) return Response.json({ success: false, message: 'Event not found' }, { status: 404 });

		if (event.ownerId !== userId) throw ERRORS_DETAILS.permission_denied();

		await prisma.musicEvent.delete({ where: { id: eventId } });
		publishEventChange(eventId, 'event.deleted', userId);

		return Response.json({ success: true }, { status: 200 });
	});
}
