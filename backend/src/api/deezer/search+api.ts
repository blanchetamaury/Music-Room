import { rateLimit } from '@/lib/apply-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { mapSearch } from '@/format/mapTrack';
import { searchTracks } from '../../../prisma/database/deezer';

export async function GET(req: Request) {
	const limited = await rateLimit(req, RATE_LIMITS.deezerSearch);
	if (limited) return limited;

	const url = new URL(req.url);
	const q = url.searchParams.get('q');
	if (!q) {
		return Response.json({ error: 'missing query' }, { status: 400 });
	}

	try {
		const tracks = await searchTracks(q);
		return Response.json({ success: true, data: mapSearch(tracks) });
	} catch (err) {
		console.error('[searchTracks]', err);
		return Response.json({ error: 'search failed' }, { status: 502 });
	}
}
