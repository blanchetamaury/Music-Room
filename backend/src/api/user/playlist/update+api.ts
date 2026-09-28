import { errorHandler } from '@/utils/error';
import { rateLimit } from '@/lib/apply-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { parseBody } from '@/utils/parsing';
import { UpdatePlaylistSchema } from '@/schema/CreatePlaylistSchema';
import { canEditPlaylist } from '@/lib/permissions';
import { updatePlaylist } from '../../../../prisma/database/playlists';
import { publishPlaylistChange } from '@/lib/realtimePublish';
import type { UpdatePlaylist } from '@/types/playlist/Playlist';

export async function PATCH(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const limited = await rateLimit(req, RATE_LIMITS.playlistMutation);
		if (limited) return limited;

		const userId = await requireVerifiedEmail(req);

		const data = await parseBody<UpdatePlaylist>(req, UpdatePlaylistSchema);

		const canEdit = await canEditPlaylist(data.playlistId, userId);
		if (!canEdit) {
			return Response.json({ success: false, message: 'Not allowed to edit this playlist' }, { status: 403 });
		}

		try {
			const updated = await updatePlaylist(data.playlistId, userId, {
				name: data.name,
				description: data.description,
				cover: data.cover,
				visibility: data.visibility,
				editPolicy: data.editPolicy,
				expectedVersion: data.expectedVersion,
			});
			publishPlaylistChange(data.playlistId, 'playlist.updated', userId, updated.version);
			return Response.json({ success: true, data: { version: updated.version } }, { status: 200 });
		} catch (e) {
			if (e instanceof Error && e.message === 'VERSION_CONFLICT') {
				return Response.json(
					{ success: false, message: 'Playlist was modified concurrently, please refresh and try again' },
					{ status: 409 }
				);
			}
			throw e;
		}
	});
}
