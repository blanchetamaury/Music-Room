export async function POST(req: Request) {
	const url = new URL(req.url);
	const q = url.searchParams.get('q');
	if (!q) {
		return Response.json({ error: 'missing query' }, { status: 400 });
	}

	try {
		return Response.json({ data: 'tracks' });
	} catch (err) {
		console.error('[searchTracks]', err);
		return Response.json({ error: 'search failed' }, { status: 502 });
	}
}
