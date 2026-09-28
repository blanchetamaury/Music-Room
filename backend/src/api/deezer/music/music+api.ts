import { rateLimit } from '@/lib/apply-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { getTrack } from '../../../../prisma/database/deezer';

export async function GET(_req: Request) {
	const limited = await rateLimit(_req, RATE_LIMITS.deezerLookup);
	if (limited) return limited;

	try {
		const url = new URL(_req.url);
		const q = url.searchParams.get('music_id');

		if (q == null) return Response.json({ error: 'parameter not found' }, { status: 404 });
		const track = await getTrack(q);

		return Response.json({ success: true, data: track });
	} catch (err) {
		console.error('[getTrack]', err);
		return Response.json({ error: 'not found' }, { status: 404 });
	}
}
