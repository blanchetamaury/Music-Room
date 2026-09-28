import { errorHandler } from '@/utils/error';
import { rateLimit } from '@/lib/apply-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { getArtistAlbums } from '../../../../prisma/database/deezer';
import { mapAlbum } from '@/format/mapAlbum';

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
		const albums = await getArtistAlbums(artistId, Number.isFinite(limit) ? limit : 25);

		return Response.json(
			{ success: true, data: albums.map((album: any) => mapAlbum(album, null)) },
			{ status: 200 }
		);
	});
}
