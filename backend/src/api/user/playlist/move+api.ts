import { rateLimit } from '@/lib/apply-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { ERRORS_DETAILS, errorHandler } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { parseBody } from '@/utils/parsing';
import { MoveTrackSchema } from '@/schema/CreatePlaylistSchema';
import { canEditPlaylist } from '@/lib/permissions';
import { moveTrack } from '../../../../prisma/database/playlists';
import { publishPlaylistChange } from '@/lib/realtimePublish';
import { isConcurrencyConflict, isRecordNotFound } from '@/utils/prisma';
import { z } from 'zod';

export async function PATCH(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const limited = await rateLimit(req, RATE_LIMITS.playlistMutation);
		if (limited) return limited;

		const userId = await requireVerifiedEmail(req);

		const data = await parseBody<z.infer<typeof MoveTrackSchema>>(req, MoveTrackSchema);

		if (!(await canEditPlaylist(data.playlistId, userId))) {
			return Response.json({ success: false, message: 'Not allowed to edit this playlist' }, { status: 403 });
		}

		try {
			const result = await moveTrack(
				data.playlistId,
				data.trackId,
				data.newPosition,
				userId,
				data.expectedVersion
			);

			publishPlaylistChange(data.playlistId, 'track.moved', userId, result.version);

			return Response.json(
				{
					success: true,
					data: {
						playlistId: data.playlistId,
						version: result.version,
						tracks: result.tracks,
					},
				},
				{ status: 200 }
			);
		} catch (e) {
			if (e instanceof Error && e.message === 'VERSION_CONFLICT') {
				return ERRORS_DETAILS.conflict();
			}
			if (e instanceof Error && e.message === 'Playlist not found') {
				return ERRORS_DETAILS.not_found('Playlist');
			}
			if (e instanceof Error && e.message === 'Track not found in playlist') {
				return ERRORS_DETAILS.not_found('Track');
			}
			if (isRecordNotFound(e)) {
				return ERRORS_DETAILS.not_found('Playlist');
			}
			if (isConcurrencyConflict(e)) {
				return ERRORS_DETAILS.conflict();
			}
			throw e;
		}
	});
}

export const POST = PATCH;
