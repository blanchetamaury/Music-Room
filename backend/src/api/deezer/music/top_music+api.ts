import { rateLimit } from '@/lib/apply-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { Request } from 'express';
import { getChart } from '../../../../prisma/database/deezer';
import { mapSearch } from '@/format/mapTrack';

export async function GET(req: globalThis.Request) {
	const limited = await rateLimit(req, RATE_LIMITS.deezerLookup);
	if (limited) return limited;

	const url = new URL(req.url);
	const count = url.searchParams.get('count');

	let value = Number(count);
	if (value <= 0) value = 50;
	if (value >= 200) value = 200;

	const tracks = await getChart(value);

	return Response.json({ success: true, data: mapSearch(tracks) });
}
