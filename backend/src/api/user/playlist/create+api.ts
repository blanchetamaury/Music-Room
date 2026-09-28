import { rateLimit } from '@/lib/apply-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { ERRORS_DETAILS, errorHandler } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { parseBody } from '@/utils/parsing';
import { CreatePlaylistSchema } from '@/schema/CreatePlaylistSchema';
import { createPlaylist } from '../../../../prisma/database/playlists';
import { isUniqueViolation } from '@/utils/prisma';
import type { CreatePlaylist } from '@/types/playlist/Playlist';

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const limited = await rateLimit(req, RATE_LIMITS.playlistMutation);
		if (limited) return limited;

		const userId = await requireVerifiedEmail(req);

		const data = await parseBody<CreatePlaylist>(req, CreatePlaylistSchema);

		try {
			const playlist = await createPlaylist({ ...data, ownerId: userId, cover: data.cover ?? undefined });
			return Response.json({ success: true, data: playlist }, { status: 201 });
		} catch (e) {
			if (isUniqueViolation(e)) {
				return Response.json(
					{ success: false, message: 'You already own a playlist with this name' },
					{ status: 409 }
				);
			}
			throw e;
		}
	});
}
