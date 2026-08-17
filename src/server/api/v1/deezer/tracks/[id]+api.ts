import { getTrack } from "../../../../prisma/deezer"

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const track = await getTrack(params.id)
    if (!track) {
      return Response.json({ error: 'Track not found' }, { status: 404 })
    }
    return Response.json({ data: track })
  } catch (err) {
    console.error('[getTrack]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}