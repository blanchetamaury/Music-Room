import { outputAPIAlbum } from '@/src/types/album/album';
import { ApiResponse } from '@/src/types/api/ApiResponse';
import { DeezerArtist } from '@/src/types/deezer/deezer';
import { privateUser } from '@/src/types/user/PrivateUser';
import { Like } from '@/src/types/user/like';
import { auth } from './auth';
import { Track } from '@/src/types/track/track';
import { OutputTrackDeezer } from '@/src/types/deezer/OutputDeezerTrack';
import { PlaylistOutput } from '@/src/types/playlist/PlaylistOutput';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
	const url = `${process.env.EXPO_PUBLIC_API_URL}${endpoint}`;

	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		...options.headers,
	};

	const response = await fetch(url, {
		...options,
		headers,
		credentials: 'include',
	});

	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		return {
			success: false,
			message: data.message || `HTTP error ${response.status}`,
		};
	}

	return {
		success: true,
		data: data.data as T,
	};
}

export const api = {
	auth: auth,
	user: {
		me: () => {
			return fetchApi<privateUser>(`/user/me`);
		},
		playlist: {
			create: (name: string, cover: string, description: string, privatePlaylist: boolean, token: string) => {
				return fetchApi<{ success: boolean; status: number }>(`/user/playlist/create`, {
					method: 'POST',
					body: JSON.stringify({
						name: name,
						cover: cover,
						description: description,
						private: privatePlaylist,
					}),
					headers: { Authorization: `Bearer ${token}` },
				});
			},
			playlists: (token: string) => {
				return fetchApi<PlaylistOutput[]>(`/user/playlist/playlists`, {
					headers: { Authorization: `Bearer ${token}` },
				});
			},
			addMusic: (token: string, playlistName: string, trackId: string) => {
				return fetchApi<{ success: boolean; status: number }>(`/user/playlist/addMusic`, {
					method: 'POST',
					body: JSON.stringify({
						playlistName: playlistName,
						trackId: trackId,
					}),
					headers: { Authorization: `Bearer ${token}` },
				});
			}
		}, 
		like: {
			create: (trakcId: string, token: string) => {
				return fetchApi<{ success: boolean; status: number }>(`/user/like/create?track_id=${trakcId}`, {
					method: 'POST',
					body: JSON.stringify({}),
					headers: { Authorization: `Bearer ${token}` },
				});
			},
			delete: (trakcId: string, token: string) => {
				return fetchApi<{ success: boolean; status: number }>(`/user/like/delete?track_id=${trakcId}`, {
					method: 'DELETE',
					body: JSON.stringify({}),
					headers: { Authorization: `Bearer ${token}` },
				});
			},
			like: (trakcId: string, token: string) => {
				return fetchApi<Like>(`/user/like/like?track_id=${trakcId}`, {
					headers: { Authorization: `Bearer ${token}` },
				});
			},
			likes: (token: string) => {
				return fetchApi<Like[]>(`/user/like/likes`, {
					headers: { Authorization: `Bearer ${token}` },
				});
			},
		},
	},
	deezer: {
		music: {
			top_music: (count: number) => {
				return fetchApi<OutputTrackDeezer[]>(`/deezer/music/top_music?count=${count}`);
			},
			music: (music_deezer_id: number) => {
				return fetchApi<Track>(`/deezer/music/music?music_id=${music_deezer_id.toString()}`);
			},
		},
		album: {
			album: (deezerCUID: string) => {
				return fetchApi<outputAPIAlbum>(`/deezer/album/album?deezer_id=${deezerCUID}`);
			},
		},
		artist: {
			artist: (deezerCUID: string) => {
				return fetchApi<DeezerArtist>(`/deezer/artist/artist?deezer_id=${deezerCUID}`);
			},
		},
		search: (search: string, limit: number) => {
			return fetchApi<OutputTrackDeezer[]>(`/deezer/search?q=${encodeURI(search)}&limit=${limit}`);
		},
	},
};
