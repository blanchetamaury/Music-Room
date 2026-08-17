import { searchTracks } from "../../../../prisma/deezer"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q')
  const limit = parseInt(url.searchParams.get('limit') || '25', 10)

  if (!q) {
    return Response.json({ error: 'Missing query parameter "q"' }, { status: 400 })
  }

  try {
    const tracks = await searchTracks(q, limit)
    return Response.json({ data: tracks })
  } catch (err) {
    console.error('[searchTracks]', err)
    return Response.json({ error: 'Search failed' }, { status: 502 })
  }
}