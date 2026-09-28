import { errorHandler } from '@/utils/error';
import { getUserFromToken } from '@/utils/token';
import { getUserById } from '../../../../prisma/database/user';
import { getPlaylist } from '../../../../prisma/database/playlists';

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await getUserFromToken(req);

		if (!userId) return Response.json({ success: false, message: 'No token provided' }, { status: 401 });

		const user = await getUserById(userId, {});
		if (!user) return Response.json({ success: false, message: 'User not found' }, { status: 404 });

		const playlistId = new URL(req.url).searchParams.get('playlist_id');
		if (!playlistId) return Response.json({ success: false, message: 'No playlist ID provided' }, { status: 400 });

		const data = await getPlaylist(playlistId, {
			user: true,
			music: { include: { track: { include: { album: true } } } },
		});
		if (!data) return Response.json({ success: false, message: 'Playlist not found' }, { status: 404 });

		return Response.json({ success: true, data: data }, { status: 200 });
	});
}
