import { errorHandler } from '@/utils/error';
import { getUserFromToken } from '@/utils/token';
import { parseBody } from '@/utils/parsing';
import { UpdatePlaylist } from '@/types/playlist/Playlist';
import { UpdatePlaylistSchema } from '@/schema/CreatePlaylistSchema';
import { updatePlaylist } from '../../../../prisma/database/playlists';

export async function PATCH(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const ownerId = await getUserFromToken(req);
		if (!ownerId) return Response.json({ success: false, message: 'No token provided' }, { status: 401 });

		const data = await parseBody<UpdatePlaylist>(req, UpdatePlaylistSchema);
		const updated = await updatePlaylist(data.playlistId, ownerId, data.name);

		if (updated.count === 0) {
			return Response.json({ success: false, message: 'Playlist not found' }, { status: 404 });
		}

		return Response.json({ success: true }, { status: 200 });
	});
}
