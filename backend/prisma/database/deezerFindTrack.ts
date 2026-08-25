import { mapAlbum } from "@/format/mapAlbum";
import { mapArtist } from "@/format/mapArtist";
import { mapGenre } from "@/format/mapGenre";
import { mapTrack } from "@/format/mapTrack";
import { OutputTrackDeezer } from "@/types/deezer/deezer";
import { createAllDataTrack } from "@/types/track/track";
import { findAlbum } from "./album";
import { findArtist } from "./artist";
import { findGenre } from "./genre";
import { prisma } from "./prisma";

const DEEZER_API = 'https://api.deezer.com'

const findTrackToDb = async (deezerId: string) => {
  const cached = await prisma.track.findUnique({ include: { album: true, artists: true }, where: { deezerCUID: deezerId } })

  if (cached?.previewUrl) {
    const match = cached.previewUrl.match(/exp=(\d+)/);
    const exp = match ? parseInt(match[1], 10) : null;

    if (Date.now() < Number(exp)) return [cached, true];
  }
  return [cached, false];
}

const getDeezerTrack = async (deezerId: string): Promise<OutputTrackDeezer> => {
	const res = await fetch(`${DEEZER_API}/track/${deezerId}`)
	if (!res.ok) {
		throw new Error(`Deezer ${res.status}`)
	}

	const json = await res.json()
	if (json.error) {
		throw new Error(`Deezer error: ${json.error.message ?? 'unknown'} ${deezerId}`)
	}
	return mapTrack(json);
}

const listArtist = async (track: OutputTrackDeezer, newTrack: createAllDataTrack) => {
	for ( const row of track.artist) {
      const artistToDb = await findArtist(row.deezerCUID.toString());
      if (!artistToDb) {
        const res = await fetch(`${DEEZER_API}/artist/${row.deezerCUID}`);
        if (!res.ok) throw new Error(`Deezer artist ${res.status}`);
        const artistJson = await res.json();
        if (newTrack.artist.find((e) => e.deezerCUID == artistJson.id) == undefined)
          newTrack.artist.push(mapArtist(artistJson));
      } else {
        const { id, updatedAt, createdAt, ...toPush } = artistToDb;
        if (newTrack.artist.find((e) => e.deezerCUID == toPush.deezerCUID) == undefined)
          newTrack.artist.push(toPush);
      }
    }
	return newTrack;
}

const getAlbumToDeezer = async (track: OutputTrackDeezer, newTrack: createAllDataTrack) => {
  const albumToDb = await findAlbum({ genre: true }, track.album.deezerCUID);
  if (!albumToDb) {
    const res = await fetch(`${DEEZER_API}/album/${track.album.deezerCUID}`);
    if (!res.ok) throw new Error(`Deezer album ${res.status}`);
    const albumJson = await res.json();

    let genre = null;
    if (albumJson.genre_id) {
      const genreToDb = await findGenre(String(albumJson.genre_id));
      if (!genreToDb) {
        const resGenre = await fetch(`${DEEZER_API}/genre/${albumJson.genre_id}`);
        if (resGenre.ok) {
          const GenreJson = await resGenre.json();
          genre = mapGenre(GenreJson);
        }
      } else {
        const { id, ...rest } = genreToDb;
        genre = rest;
      }
    }

    newTrack.album = mapAlbum(albumJson, genre);
  } else {
    const { id, updatedAt, genre, genreId, ...toPush } = albumToDb;
    newTrack.album = {
      genre: genre ?? null,
      ...toPush,
    };
  }
  return newTrack;
};

export { findTrackToDb, getAlbumToDeezer, getDeezerTrack, listArtist };
