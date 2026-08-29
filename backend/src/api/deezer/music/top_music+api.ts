import { Request } from 'express';
import { getChart } from '../../../../prisma/database/deezer';
import { mapSearch } from '@/format/mapTrack';

export async function GET(req: Request) {
	const url = new URL(req.url);
	const count = url.searchParams.get('count');

	let value = Number(count);
	if (value <= 0) value = 50;
	if (value >= 200) value = 200;

	const tracks = await getChart(value);

	return Response.json({ success: true, data: mapSearch(tracks) });
}
