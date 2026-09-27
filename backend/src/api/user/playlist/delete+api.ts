import { errorHandler } from '@/utils/error';
import { getUserFromToken } from '@/utils/token';
import { deletePlaylist } from '../../../../prisma/database/playlists';

export async function DELETE(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const ownerId = await getUserFromToken(req);
		const playlistId = new URL(req.url).searchParams.get('playlist_id');
		if (!ownerId) return Response.json({ success: false, message: 'No token provided' }, { status: 401 });
		if (!playlistId) return Response.json({ success: false, message: 'No playlist ID provided' }, { status: 400 });
		const deleted = await deletePlaylist(playlistId, ownerId);
		if (deleted.count === 0) return Response.json({ success: false, message: 'Playlist not found' }, { status: 404 });
		return Response.json({ success: true }, { status: 200 });
	});
}