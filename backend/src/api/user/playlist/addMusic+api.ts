import { errorHandler } from '@/utils/error';
import { rateLimit } from '@/lib/apply-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { parseBody } from '@/utils/parsing';
import { AddMusicToPlaylistSchema } from '@/schema/CreatePlaylistSchema';
import { canEditPlaylist } from '@/lib/permissions';
import { addTrack } from '../../../../prisma/database/playlists';
import { publishPlaylistChange } from '@/lib/realtimePublish';
import { getTrack } from '../../../../prisma/database/deezer';
import { mapUpstreamError } from '@/utils/upstream';
import type { AddMusicToPlaylist } from '@/types/playlist/Playlist';

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const limited = await rateLimit(req, RATE_LIMITS.playlistMutation);
		if (limited) return limited;

		const userId = await requireVerifiedEmail(req);

		const data = await parseBody<AddMusicToPlaylist>(req, AddMusicToPlaylistSchema);

		const canEdit = await canEditPlaylist(data.playlistId, userId);
		if (!canEdit) {
			return Response.json({ success: false, message: 'Not allowed to edit this playlist' }, { status: 403 });
		}

		try {
			await getTrack(data.trackId);
		} catch (e) {
			const mapped = mapUpstreamError(e);
			if (mapped) return mapped;
			throw e;
		}

		try {
			await addTrack(data.playlistId, data.trackId, data.position, userId);
		} catch (e) {
			const mapped = mapUpstreamError(e);
			if (mapped) return mapped;
			throw e;
		}

		publishPlaylistChange(data.playlistId, 'track.added', userId);
		return Response.json({ success: true }, { status: 200 });
	});
}
