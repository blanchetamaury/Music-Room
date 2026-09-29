import { rateLimit } from '@/lib/apply-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { getTrack } from '../../../../prisma/database/deezer';
import { mapUpstreamError } from '@/utils/upstream';

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
		const mapped = mapUpstreamError(err);
		if (mapped) return mapped;

		console.error('[getTrack]', err);
		return Response.json({ success: false, message: 'not found' }, { status: 404 });
	}
}
