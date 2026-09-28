import { errorHandler } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { deletePlaylist } from '../../../../prisma/database/playlists';

export async function DELETE(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);
		const playlistId = new URL(req.url).searchParams.get('playlist_id');
		if (!playlistId) return Response.json({ success: false, message: 'No playlist ID provided' }, { status: 400 });

		try {
			await deletePlaylist(playlistId, userId);
			return Response.json({ success: true }, { status: 200 });
		} catch (e) {
			return Response.json({ success: false, message: 'Playlist not found or not owner' }, { status: 404 });
		}
	});
}
