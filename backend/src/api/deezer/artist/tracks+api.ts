import { errorHandler } from '@/utils/error';
import { rateLimit } from '@/lib/apply-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { getArtistTopTracks } from '../../../../prisma/database/deezer';
import { mapSearch } from '@/format/mapTrack';

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const limited = await rateLimit(req, RATE_LIMITS.deezerLookup);
		if (limited) return limited;

		const url = new URL(req.url);
		const artistId = url.searchParams.get('deezer_id');

		if (!artistId) {
			return Response.json({ success: false, message: 'missing deezer_id' }, { status: 400 });
		}

		const limit = Number(url.searchParams.get('limit') ?? 25);
		const tracks = await getArtistTopTracks(artistId, Number.isFinite(limit) ? limit : 25);

		return Response.json({ success: true, data: mapSearch(tracks) }, { status: 200 });
	});
}
