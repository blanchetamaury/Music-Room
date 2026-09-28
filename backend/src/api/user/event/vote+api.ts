import { errorHandler } from '@/utils/error';
import { rateLimit } from '@/lib/apply-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { parseBody } from '@/utils/parsing';
import { EventVoteSchema } from '@/schema/MusicEventSchema';
import { checkEventVotingAccess } from '@/lib/permissions';
import { addVote, removeVote, TrackNotInEventError, EventNotFoundError } from '../../../../prisma/database/musicEvent';
import { publishEventChange } from '@/lib/realtimePublish';
import { z } from 'zod';

const denialMessage = (reason: string): string => {
	switch (reason) {
		case 'NOT_A_MEMBER':
			return 'You are not a member of this event';
		case 'INVALID_LOCATION':
			return 'This event requires a valid position to vote';
		case 'LOCATION_OUT_OF_RADIUS':
			return 'You are outside the voting radius of this event';
		case 'OUTSIDE_TIME_WINDOW':
			return 'Voting is closed for this event';
		case 'EVENT_NOT_FOUND':
			return 'Event not found';
		default:
			return 'Not allowed to vote on this event';
	}
};

const authorize = async (
	eventId: string,
	userId: string,
	latitude: number | undefined,
	longitude: number | undefined
) => {
	const access = await checkEventVotingAccess(eventId, userId, { latitude, longitude });
	return access;
};

export async function PUT(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const limited = await rateLimit(req, RATE_LIMITS.eventVote);
		if (limited) return limited;

		const userId = await requireVerifiedEmail(req);

		const body = await parseBody<z.infer<typeof EventVoteSchema>>(req, EventVoteSchema);

		const access = await authorize(body.eventId, userId, body.latitude, body.longitude);
		if (!access.allowed) {
			const status = access.reason === 'EVENT_NOT_FOUND' ? 404 : 403;
			return Response.json({ success: false, message: denialMessage(access.reason) }, { status });
		}

		try {
			const result = await addVote(body.eventId, body.trackId, userId);
			publishEventChange(body.eventId, 'track.voted', userId, result.voteCount);
			return Response.json(
				{ success: true, data: { voted: result.voted, voteCount: result.voteCount } },
				{ status: 200 }
			);
		} catch (e) {
			if (e instanceof TrackNotInEventError || e instanceof EventNotFoundError) {
				return Response.json({ success: false, message: 'Track not found in this event' }, { status: 404 });
			}
			throw e;
		}
	});
}

export async function DELETE(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const limited = await rateLimit(req, RATE_LIMITS.eventVote);
		if (limited) return limited;

		const userId = await requireVerifiedEmail(req);

		const body = await parseBody<z.infer<typeof EventVoteSchema>>(req, EventVoteSchema);

		const access = await authorize(body.eventId, userId, body.latitude, body.longitude);
		if (!access.allowed) {
			const status = access.reason === 'EVENT_NOT_FOUND' ? 404 : 403;
			return Response.json({ success: false, message: denialMessage(access.reason) }, { status });
		}

		try {
			const result = await removeVote(body.eventId, body.trackId, userId);
			publishEventChange(body.eventId, 'track.unvoted', userId, result.voteCount);
			return Response.json(
				{ success: true, data: { voted: result.voted, voteCount: result.voteCount } },
				{ status: 200 }
			);
		} catch (e) {
			if (e instanceof TrackNotInEventError || e instanceof EventNotFoundError) {
				return Response.json({ success: false, message: 'Track not found in this event' }, { status: 404 });
			}
			throw e;
		}
	});
}
