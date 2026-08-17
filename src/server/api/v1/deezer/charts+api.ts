import { getChart } from "../../../prisma/deezer"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const limit = parseInt(url.searchParams.get('limit') || '50', 10)

  try {
    const tracks = await getChart(limit)
    return Response.json({ data: tracks })
  } catch (err) {
    console.error('[getChart]', err)
    return Response.json({ error: 'Failed to fetch charts' }, { status: 500 })
  }
}