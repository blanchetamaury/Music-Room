import { getChart } from "../../prisma/deezer"

export async function GET() {
  const tracks = await getChart(200)
  return Response.json({ data: tracks })
}