import { errorHandler } from '@/utils/error';
import { getUserFromToken } from '@/utils/token';
import { getUserById } from '../../../../prisma/database/user';
import { parseBody } from '@/utils/parsing';
import { AddMusicToPlaylist } from '@/types/playlist/Playlist';
import { AddMusicToPlaylistSchema } from '@/schema/CreatePlaylistSchema';
import { addMusictoPlaylist, getPlaylist } from '../../../../prisma/database/playlists';

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await getUserFromToken(req);

		if (!userId) return Response.json({ success: false, message: 'No token provided' }, { status: 401 });

		const user = await getUserById(userId, {});

		if (!user) return Response.json({ success: false, message: 'User not found' }, { status: 404 });

		const data = await parseBody<AddMusicToPlaylist>(req, AddMusicToPlaylistSchema);

		const playlist = await getPlaylist(data.playlistId, { music: true, user: true });

		if (!playlist) return Response.json({ success: false, message: 'Playlist not found' }, { status: 404 });

		if (playlist.user.find((u) => u.id === user.id) === undefined && playlist.ownerId !== user.id) {
			return Response.json(
				{ success: false, message: 'You are not the owner of this playlist' },
				{ status: 403 }
			);
		}

		if (playlist.music.find((m) => m.trackId === data.trackId) !== undefined) {
			return Response.json({ success: false, message: 'Music already in playlist' }, { status: 400 });
		}

		await addMusictoPlaylist(data.playlistId, data.trackId);
		return Response.json({ success: true }, { status: 200 });
	});
}
