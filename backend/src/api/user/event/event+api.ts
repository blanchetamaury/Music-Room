import { errorHandler } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { canReadEvent } from '@/lib/permissions';
import { getEventById } from '../../../../prisma/database/musicEvent';
import { getTrack } from '../../../../prisma/database/deezer';

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);

		const eventId = new URL(req.url).searchParams.get('event_id');
		if (!eventId) return Response.json({ success: false, message: 'No event ID provided' }, { status: 400 });

		if (!(await canReadEvent(eventId, userId))) {
			return Response.json({ success: false, message: 'Event not found' }, { status: 404 });
		}

		const event = await getEventById(eventId);

		if (!event) return Response.json({ success: false, message: 'Event not found' }, { status: 404 });

		const myVotes = new Set(
			event.tracks.filter((t) => t.votes.some((v) => v.userId === userId)).map((t) => t.trackId)
		);

		const tracks = await Promise.all(
			event.tracks.map(async (t) => {
				const track = await getTrack(t.trackId).catch(() => null);
				return {
					trackId: t.trackId,
					status: t.status,
					voteCount: t.voteCount,
					suggestedBy: t.suggestedBy,
					createdAt: t.createdAt,
					votedByMe: myVotes.has(t.trackId),
					track,
				};
			})
		);

		tracks.sort((a, b) => b.voteCount - a.voteCount || a.createdAt.getTime() - b.createdAt.getTime());

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
					ownerId: event.ownerId,
					createdAt: event.createdAt,
					members: event.members.map((m) => ({
						id: m.user.id,
						username: m.user.username,
						avatarUrl: m.user.avatarUrl,
						role: m.role,
					})),
					tracks,
					canEdit: event.ownerId === userId,
				},
			},
			{ status: 200 }
		);
	});
}
