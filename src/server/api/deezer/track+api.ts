import { getTrack } from "../../prisma/deezer"

export async function GET(
  _req: Request,
  { params }: { params: { deezerId: string } }
) {
  try {
    const track = await getTrack(params.deezerId)
    return Response.json({ track })
  } catch (err) {
    console.error('[getTrack]', err)
    return Response.json({ error: 'not found' }, { status: 404 })
  }
}