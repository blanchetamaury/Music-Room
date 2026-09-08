import { errorHandler } from '@/utils/error';
import { getUserFromToken } from '@/utils/token';
import { getUserById } from '../../../../prisma/database/user';
import { parseBody } from '@/utils/parsing';
import { CreatePlaylist } from '@/types/playlist/Playlist';
import { CreatePlaylistSchema } from '@/schema/CreatePlaylistSchema';
import { createOrUpdatePlaylist } from '../../../../prisma/database/playlists';

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await getUserFromToken(req);

		if (!userId) return Response.json({ success: false, message: 'No token provided' }, { status: 401 });

		const user = await getUserById(userId, {});

		if (!user) return Response.json({ success: false, message: 'User not found' }, { status: 404 });

		const data = await parseBody<CreatePlaylist>(req, CreatePlaylistSchema);

		await createOrUpdatePlaylist(data, user.id);
		return Response.json({ success: true }, { status: 200 });
	});
}
