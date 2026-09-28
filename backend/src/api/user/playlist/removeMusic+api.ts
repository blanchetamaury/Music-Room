import { errorHandler } from '@/utils/error';
import { getUserFromToken } from '@/utils/token';
import { parseBody } from '@/utils/parsing';
import { RemoveMusicFromPlaylistSchema } from '@/schema/CreatePlaylistSchema';
import { getPlaylist, removeMusictoPlaylist } from '../../../../prisma/database/playlists';
import { z } from 'zod';

export async function DELETE(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const ownerId = await getUserFromToken(req);
		if (!ownerId) return Response.json({ success: false, message: 'No token provided' }, { status: 401 });
		const data = await parseBody<z.infer<typeof RemoveMusicFromPlaylistSchema>>(req, RemoveMusicFromPlaylistSchema);
		const playlist = await getPlaylist(data.playlistId, { user: true });
		if (!playlist || playlist.ownerId !== ownerId) return Response.json({ success: false, message: 'Playlist not found' }, { status: 404 });
		await removeMusictoPlaylist(data.playlistId, data.trackId);
		return Response.json({ success: true }, { status: 200 });
	});
}