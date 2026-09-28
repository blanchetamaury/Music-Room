import { errorHandler } from '@/utils/error';
import { rateLimit } from '@/lib/apply-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { findAlbum } from '../../../../prisma/database/album';

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const limited = await rateLimit(req, RATE_LIMITS.deezerLookup);
		if (limited) return limited;

		const url = new URL(req.url);
		const deezerId = url.searchParams.get('deezer_id');

		if (!deezerId) {
			return Response.json({ error: 'missing deezer_id' }, { status: 400 });
		}

		const album = await findAlbum({ tracks: true }, deezerId);

		if (!album) return Response.json({ success: false, message: 'User not found' }, { status: 404 });

		const { id, releaseDate, updatedAt, genreId, ...albumRes } = album;
		return Response.json({ success: true, data: albumRes }, { status: 200 });
	});
}
