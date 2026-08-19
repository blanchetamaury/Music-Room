import { getChart } from "../../../prisma/database/deezer"

export async function GET() {
  const tracks = await getChart(200)
  return Response.json({ data: tracks })
}