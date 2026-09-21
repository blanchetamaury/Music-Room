import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { unwrapApiResponse } from './helpers';

export const deezerQueryKeys = {
	all: ['deezer'] as const,
	topMusic: (count: number) => ['deezer', 'top-music', count] as const,
	music: (id: number) => ['deezer', 'music', id] as const,
	album: (id: string) => ['deezer', 'album', id] as const,
	artist: (id: string) => ['deezer', 'artist', id] as const,
	search: (query: string, limit: number) => ['deezer', 'search', query, limit] as const,
};

export function useTopMusicQuery(count = 50) {
	return useQuery({
		queryKey: deezerQueryKeys.topMusic(count),
		queryFn: () => api.deezer.music.top_music(count).then(unwrapApiResponse),
	});
}

export function useMusicQuery(id: number | null) {
	return useQuery({
		queryKey: deezerQueryKeys.music(id ?? 0),
		queryFn: () => api.deezer.music.music(id ?? 0).then(unwrapApiResponse),
		enabled: id !== null,
	});
}

export function useAlbumQuery(id: string | null) {
	return useQuery({
		queryKey: deezerQueryKeys.album(id ?? ''),
		queryFn: () => api.deezer.album.album(id ?? '').then(unwrapApiResponse),
		enabled: Boolean(id),
	});
}

export function useArtistQuery(id: string | null) {
	return useQuery({
		queryKey: deezerQueryKeys.artist(id ?? ''),
		queryFn: () => api.deezer.artist.artist(id ?? '').then(unwrapApiResponse),
		enabled: Boolean(id),
	});
}

export function useSearchQuery(query: string, limit = 20) {
	return useQuery({
		queryKey: deezerQueryKeys.search(query, limit),
		queryFn: () => api.deezer.search(query, limit).then(unwrapApiResponse),
		enabled: query.trim().length > 0,
	});
}
