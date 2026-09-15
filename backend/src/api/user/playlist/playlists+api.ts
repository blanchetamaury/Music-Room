import { errorHandler } from '@/utils/error';
import { getUserFromToken } from '@/utils/token';
import { getUserById } from '../../../../prisma/database/user';
import { getPlaylists } from '../../../../prisma/database/playlists';

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await getUserFromToken(req);

		if (!userId) return Response.json({ success: false, message: 'No token provided' }, { status: 401 });

		const user = await getUserById(userId, {});

		if (!user) return Response.json({ success: false, message: 'User not found' }, { status: 404 });

		const data = await getPlaylists(user.id, { user: true, music: true });
		
		const list = data.map((row) => ({
			name: row.name,
			cover: row.cover,
			description: row.description,
			private: row.private,
			id: row.id,
			ownerId: row.ownerId,
			user: row.user.map((row) => ({
				id: row.id,
				username: row.username,
				avatarUrl: row.avatarUrl
			})),
			music: row.music.map((row) => ({
				id: row.id,
				position: row.position,
				added_at: row.addedAt,
				trackId: row.trackId,
			})),
		}));

		return Response.json({ success: true, data: list }, { status: 200 });
	});
}
