import { getTrack } from "../../../../prisma/database/deezer"

export async function GET(
  _req: Request) {
  try {
    const url = new URL(_req.url);
    const q = url.searchParams.get('q');
    
    if (q == null) return Response.json({ error: 'not found' }, { status: 404 })
    const track = await getTrack(q);
    
    return Response.json({ track })
  } catch (err) {
    console.error('[getTrack]', err)
    return Response.json({ error: 'not found' }, { status: 404 })
  }
}