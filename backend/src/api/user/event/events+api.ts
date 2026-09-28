import { errorHandler } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { getEvents } from '../../../../prisma/database/musicEvent';
import { generatePaginationResponse, getPaginationParams } from '@/utils/pagination';

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);

		const url = new URL(req.url);
		const pagination = getPaginationParams(url.searchParams);
		const visibility = url.searchParams.get('visibility') as 'PUBLIC' | 'PRIVATE' | null;

		const data = await getEvents(userId, {
			visibility: visibility ?? undefined,
			page: pagination.page,
			limit: pagination.limit,
		});

		const list = data.events.map((event) => ({
			id: event.id,
			name: event.name,
			description: event.description,
			visibility: event.visibility,
			votingPolicy: event.votingPolicy,
			ownerId: event.ownerId,
			owner: event.owner
				? { id: event.owner.id, username: event.owner.username, avatarUrl: event.owner.avatarUrl }
				: null,
			memberCount: event.members.length,
			createdAt: event.createdAt,
		}));

		return Response.json(
			{ success: true, data: generatePaginationResponse(list, data.total, pagination) },
			{ status: 200 }
		);
	});
}
