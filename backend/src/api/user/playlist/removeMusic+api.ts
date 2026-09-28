import { errorHandler } from '@/utils/error';
import { rateLimit } from '@/lib/apply-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { parseBody } from '@/utils/parsing';
import { RemoveMusicFromPlaylistSchema } from '@/schema/CreatePlaylistSchema';
import { canEditPlaylist } from '@/lib/permissions';
import { removeTrack } from '../../../../prisma/database/playlists';
import { publishPlaylistChange } from '@/lib/realtimePublish';
import { z } from 'zod';

export async function DELETE(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const limited = await rateLimit(req, RATE_LIMITS.playlistMutation);
		if (limited) return limited;

		const userId = await requireVerifiedEmail(req);
		const data = await parseBody<z.infer<typeof RemoveMusicFromPlaylistSchema>>(req, RemoveMusicFromPlaylistSchema);

		const canEdit = await canEditPlaylist(data.playlistId, userId);
		if (!canEdit) {
			return Response.json({ success: false, message: 'Not allowed to edit this playlist' }, { status: 403 });
		}

		await removeTrack(data.playlistId, data.trackId, userId);
		publishPlaylistChange(data.playlistId, 'track.removed', userId);
		return Response.json({ success: true }, { status: 200 });
	});
}
