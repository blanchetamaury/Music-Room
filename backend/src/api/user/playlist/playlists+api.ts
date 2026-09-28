import { errorHandler } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { getPlaylists } from '../../../../prisma/database/playlists';
import { generatePaginationResponse, getPaginationParams } from '@/utils/pagination';
import { getTrack } from '../../../../prisma/database/deezer';

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);
		const url = new URL(req.url);
		const pagination = getPaginationParams(url.searchParams);
		const visibility = url.searchParams.get('visibility') as 'PUBLIC' | 'PRIVATE' | null;

		const data = await getPlaylists(
			userId,
			{
				owner: true,
				members: { include: { user: { select: { id: true, username: true, avatarUrl: true } } } },
				tracks: true,
			},
			{ visibility: visibility ?? undefined, page: pagination.page, limit: pagination.limit }
		);

		const list = await Promise.all(
			data.playlists.map(async (row) => {
				const tracksWithDetails = await Promise.all(
					row.tracks.map(async (t) => {
						const track = await getTrack(t.trackId);
						return { ...t, track };
					})
				);
				return {
					name: row.name,
					cover: row.cover,
					description: row.description,
					visibility: row.visibility,
					id: row.id,
					ownerId: row.ownerId,
					editPolicy: row.editPolicy,
					version: row.version,
					members: row.members.map((m) => ({
						id: m.user.id,
						username: m.user.username,
						avatarUrl: m.user.avatarUrl,
						role: m.role,
					})),
					tracks: tracksWithDetails,
				};
			})
		);

		return Response.json(
			{ success: true, data: generatePaginationResponse(list, data.total, pagination) },
			{ status: 200 }
		);
	});
}
