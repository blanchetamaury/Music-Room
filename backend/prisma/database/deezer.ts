import { prisma } from './prisma'

const DEEZER_API = 'https://api.deezer.com'
const CACHE_TTL_MS = 12 * 60 * 60 * 1000

type DeezerTrack = {
  id: string | number
  title: string
  title_short?: string
  duration: string | number
  isrc?: string
  explicit_lyrics?: boolean
  preview?: string
  release_date?: string
  rank?: string | number
  track_position?: number
  disk_number?: number
  artist: { id: string | number; name: string; picture_medium?: string }
  album: {
    id: string | number
    title: string
    cover_medium?: string
    cover_big?: string
  }
}

function mapTrack(dz: DeezerTrack) {
  return {
    deezerId:      String(dz.id),
    title:         dz.title,
    titleShort:    dz.title_short ?? null,
    duration:      Number(dz.duration),
    isrc:          dz.isrc ?? null,
    explicit:      Boolean(dz.explicit_lyrics),
    previewUrl:    dz.preview ?? null,
    releaseDate:   dz.release_date ? new Date(dz.release_date) : null,
    rank:          dz.rank ? Number(dz.rank) : null,
    trackPosition: dz.track_position ?? null,
    diskNumber:    dz.disk_number ?? null,

    artistDeezerId: String(dz.artist.id),
    artistName:     dz.artist.name,
    artistPicture:  dz.artist.picture_medium ?? null,

    albumDeezerId:  String(dz.album.id),
    albumTitle:     dz.album.title,
    albumCover:     dz.album.cover_medium ?? null,
    albumCoverBig:  dz.album.cover_big ?? null,

    fetchedAt: new Date(),
  }
}

async function getTrack(deezerId: string) {
  const cached = await prisma.track.findUnique({ where: { deezerId } })

  const isFresh =
    cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS

  if (isFresh) return cached

  const res = await fetch(`${DEEZER_API}/track/${deezerId}`)
  if (!res.ok) {
    if (cached) return cached
    throw new Error(`Deezer ${res.status}`)
  }

  const json = await res.json()
  if (json.error) {
    if (cached) return cached
    throw new Error(`Deezer error: ${json.error.message ?? 'unknown'}`)
  }

  const data = mapTrack(json as DeezerTrack)

  return prisma.track.upsert({
    where:  { deezerId },
    create: data,
    update: data,
  })
}

async function searchTracks(query: string, limit = 25) {
  const res = await fetch(
    `${DEEZER_API}/search?q=${encodeURIComponent(query)}&limit=${limit}`
  )
  if (!res.ok) throw new Error(`Deezer search ${res.status}`)

  const json = await res.json()
  if (json.error) throw new Error(`Deezer error: ${json.error.message ?? 'unknown'}`)

  const data: DeezerTrack[] = json.data ?? []

  void Promise.allSettled(
    data.map((dz) => {
      const payload = mapTrack(dz)
      return prisma.track.upsert({
        where:  { deezerId: payload.deezerId },
        create: payload,
        update: payload,
      })
    })
  )

  return data
}

async function refreshStaleTracks(deezerIds: string[]) {
  const stale = await prisma.track.findMany({
    where: {
      deezerId:  { in: deezerIds },
      fetchedAt: { lt: new Date(Date.now() - CACHE_TTL_MS) },
    },
    select: { deezerId: true },
  })

  await Promise.allSettled(stale.map((t) => getTrack(t.deezerId)))
}

async function getChart(limit = 100) {
  const res = await fetch(`${DEEZER_API}/chart/0/tracks?limit=${limit}`)
  if (!res.ok) throw new Error(`Deezer ${res.status}`)
  const { data }: { data: DeezerTrack[] } = await res.json()
  return data
}

export { getChart, getTrack, refreshStaleTracks, searchTracks }
