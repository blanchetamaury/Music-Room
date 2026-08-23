import { DeezerTrack, OutputAlbumDeezer, OutputArtistDeezer, OutputTrackDeezer } from '@/types/deezer/deezer'
import { createAllDataTrack } from '@/types/track/track'
import { findAlbum } from './album'
import { findArtist } from './artist'
import { prisma } from './prisma'
import { createOrUpdateAllDataTrack, updatePreviewTrack } from './track'

const DEEZER_API = 'https://api.deezer.com'

function mapTrack(dz: any): OutputTrackDeezer {
  return {
    deezerCUID:    String(dz.id),
    title:         dz.title,
    titleShort:    dz.title_short ?? null,
    duration:      Number(dz.duration),
    explicit:      Boolean(dz.explicit_lyrics),
    previewUrl:    dz.preview ?? null,
    releaseDate:   dz.release_date ? new Date(dz.release_date) : null,
    rank:          dz.rank ? Number(dz.rank) : null,
    trackPosition: dz.track_position ?? null,
    diskNumber:    dz.disk_number ?? null,
    bpm:           dz.bpm ?? null,
    explicitContentCover: dz.explicit_content_cover ?? null,

    artist: dz.contributors.map((row: any) => ({
      deezerCUID: row.id,
      name: row.name,
      pictureSmall: row.picture_small,
      pictureMedium: row.picture_medium,
      pictureBig: row.picture_big,
    })),

    album: {
      deezerCUID:  String(dz.album.id),
      title:     dz.album.title,
      coverSmall:     dz.album.cover_small ?? null,
      CoverMedium:  dz.album.cover_medium ?? null,
      CoverBig:  dz.album.cover_big ?? null,
    }
  }
}

function mapArtist(dz: any): OutputArtistDeezer {
  return {
    deezerCUID:    String(dz.id),
    name:          dz.name,
    pictureSmall:  dz.picture_small,
    pictureMedium: dz.picture_medium,
    pictureBig:    dz.picture_big,
    nbFan:         dz.nb_fan,
    nbAlbum:       dz.nb_album,
  }
}

function mapAlbum(dz: any): OutputAlbumDeezer {
  return {
    deezerCUID:    String(dz.id),
    title:         dz.title,
    cover:         dz.cover_small,
    coverMedium:   dz.cover_medium,
    coverBig:      dz.cover_big,
    label:         dz.label,
    recordType:    dz.record_type,
    nbTracks:      dz.nb_tracks,
    fans:          dz.fans,
    duration:      dz.duration,
    explicitLyrics: dz.explicit_lyrics,
    explicitContentCover: dz.explicit_content_cover,
    releaseDate:       dz.release_date,
  }
}

async function getTrack(deezerId: string) {
  const cached = await prisma.track.findUnique({ where: { deezerCUID: deezerId } })

  if (cached?.previewUrl) {
    const match = cached.previewUrl.match(/exp=(\d+)/);
    const exp = match ? parseInt(match[1], 10) : null;

    if (Date.now() < Number(exp)) return cached;
  }

  const res = await fetch(`${DEEZER_API}/track/${deezerId}`)
  if (!res.ok) {
    throw new Error(`Deezer ${res.status}`)
  }

  const json = await res.json()
  if (json.error) {
    throw new Error(`Deezer error: ${json.error.message ?? 'unknown'}`)
  }
  
  const data = mapTrack(json);

  if (cached) {
    return (updatePreviewTrack(data.previewUrl!, data.deezerCUID));
  } else {
    let trackData: createAllDataTrack = {
      deezerCUID: data.deezerCUID,
      title: data.title,
      titleShort: data.titleShort,
      duration: data.duration,
      explicit: data.explicit,
      previewUrl: data.previewUrl,
      releaseDate: data.releaseDate,
      rank: data.rank,
      trackPosition: data.trackPosition,
      diskNumber: data.diskNumber,
      bpm: data.bpm,
      explicitContentCover: data.explicitContentCover,
      artist: [],
      albumId: null,
      album: null,
    };

    for ( const row of data.artist) {
      const artistToDb = await findArtist(row.deezerCUID.toString());
      if (!artistToDb) {
        const res = await fetch(`${DEEZER_API}/artist/${row.deezerCUID}`);
        if (!res.ok) throw new Error(`Deezer artist ${res.status}`);
        const artistJson = await res.json();
        trackData.artist.push(mapArtist(artistJson));
      } else {
        const { id, updatedAt, createdAt, ...toPush } = artistToDb;
        trackData.artist.push(toPush);
      }
    }
    const albumToDb = await findAlbum(data.album.deezerCUID);
    if (!albumToDb) {
      const res = await fetch(`${DEEZER_API}/album/${data.album.deezerCUID}`);
      if (!res.ok) throw new Error(`Deezer album ${res.status}`);
      const albumJson = await res.json();
      trackData.album = mapAlbum(albumJson);
    } else {
      const { id, updatedAt, ...toPush } = albumToDb;
      trackData.album = toPush;
    }
    return await createOrUpdateAllDataTrack(trackData);
  }
}

async function searchTracks(query: string, limit = 25) {
  const res = await fetch(
    `${DEEZER_API}/search?q=${encodeURIComponent(query)}&limit=${limit}`
  )
  if (!res.ok) throw new Error(`Deezer search ${res.status}`)

  const json = await res.json()
  if (json.error) throw new Error(`Deezer error: ${json.error.message ?? 'unknown'}`)

  const data: DeezerTrack[] = json.data ?? []

  return data;
}

async function getChart(limit = 100) {
  const res = await fetch(`${DEEZER_API}/chart/0/tracks?limit=${limit}`)
  if (!res.ok) throw new Error(`Deezer ${res.status}`)
  const { data }: { data: DeezerTrack[] } = await res.json()
  return data
}

export { getChart, getTrack, searchTracks }
