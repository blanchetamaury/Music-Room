import { errorHandler, ERRORS_DETAILS } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { parseBody } from '@/utils/parsing';
import { CreateEventSchema } from '@/schema/MusicEventSchema';
import { prisma } from '../../../../prisma/database/prisma';
import { z } from 'zod';

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);

		const body = await parseBody<z.infer<typeof CreateEventSchema>>(req, CreateEventSchema);

		if (body.votingPolicy === 'LOCATION_TIME') {
			if (body.latitude === undefined || body.longitude === undefined || body.radius === undefined) {
				throw ERRORS_DETAILS.invalid_body();
			}
		}

		if (body.startAt && body.endAt && body.endAt <= body.startAt) {
			throw ERRORS_DETAILS.invalid_body();
		}

		const event = await prisma.musicEvent.create({
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
				ownerId: userId,
				members: {
					create: { userId, role: 'OWNER', acceptedAt: new Date() },
				},
			},
		});

		return Response.json({ success: true, data: event }, { status: 201 });
	});
}
