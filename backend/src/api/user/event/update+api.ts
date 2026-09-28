import { errorHandler, ERRORS_DETAILS } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { parseBody } from '@/utils/parsing';
import { UpdateEventSchema } from '@/schema/EventMemberSchema';
import { canEditEvent } from '@/lib/permissions';
import { prisma } from '../../../../prisma/database/prisma';
import { publishEventChange } from '@/lib/realtimePublish';
import { z } from 'zod';

export async function PATCH(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);

		const body = await parseBody<z.infer<typeof UpdateEventSchema>>(req, UpdateEventSchema);

		if (!(await canEditEvent(body.eventId, userId))) throw ERRORS_DETAILS.permission_denied();

		const current = await prisma.musicEvent.findUnique({
			where: { id: body.eventId },
			select: { latitude: true, longitude: true, radius: true, startAt: true, endAt: true },
		});
		if (!current) return Response.json({ success: false, message: 'Event not found' }, { status: 404 });

		const next = {
			latitude: body.latitude !== undefined ? body.latitude : current.latitude,
			longitude: body.longitude !== undefined ? body.longitude : current.longitude,
			radius: body.radius !== undefined ? body.radius : current.radius,
			startAt: body.startAt !== undefined ? body.startAt : current.startAt,
			endAt: body.endAt !== undefined ? body.endAt : current.endAt,
		};

		const policy = body.votingPolicy;

		if (policy === 'LOCATION_TIME') {
			if (next.latitude === null || next.longitude === null || next.radius === null) {
				return Response.json(
					{ success: false, message: 'A location, a longitude and a radius are required' },
					{ status: 400 }
				);
			}
		}

		if (next.startAt && next.endAt && next.endAt <= next.startAt) {
			return Response.json(
				{ success: false, message: 'The end date must be after the start date' },
				{ status: 400 }
			);
		}

		const event = await prisma.musicEvent.update({
			where: { id: body.eventId },
			data: {
				name: body.name,
				description: body.description,
				visibility: body.visibility,
				votingPolicy: body.votingPolicy,
				latitude: body.latitude,
				longitude: body.longitude,
				radius: body.radius,
				startAt: body.startAt,
				endAt: body.endAt,
			},
		});

		publishEventChange(body.eventId, 'event.updated', userId);

		return Response.json(
			{
				success: true,
				data: {
					id: event.id,
					name: event.name,
					description: event.description,
					visibility: event.visibility,
					votingPolicy: event.votingPolicy,
					latitude: event.latitude,
					longitude: event.longitude,
					radius: event.radius,
					startAt: event.startAt,
					endAt: event.endAt,
				},
			},
			{ status: 200 }
		);
	});
}
