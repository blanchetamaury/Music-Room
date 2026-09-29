import { errorHandler } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { canReadPlaylist } from '@/lib/permissions';
import { getPlaylistById } from '../../../../prisma/database/playlists';
import { getTrack } from '../../../../prisma/database/deezer';

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);

		const playlistId = new URL(req.url).searchParams.get('playlist_id');
		if (!playlistId) return Response.json({ success: false, message: 'No playlist ID provided' }, { status: 400 });

		const canRead = await canReadPlaylist(playlistId, userId);
		if (!canRead) {
			return Response.json({ success: false, message: 'Playlist not found' }, { status: 404 });
		}

		const data = await getPlaylistById(playlistId);
		if (!data) return Response.json({ success: false, message: 'Playlist not found' }, { status: 404 });

		// Same tolerance as the list endpoint: an unplayable track yields `track: null`
		// rather than failing the whole playlist.
		const tracksWithDetails = await Promise.all(
			data.tracks.map(async (t) => {
				const track = await getTrack(t.trackId).catch(() => null);
				return { ...t, track };
			})
		);

		return Response.json({ success: true, data: { ...data, tracks: tracksWithDetails } }, { status: 200 });
	});
}
