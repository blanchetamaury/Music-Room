import { DeezerTrack } from '@/src/types/deezer/deezer';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
	success: boolean;
	message?: string;
	data?: T;
}

interface TrackPayload {
	track: DeezerTrack;
}

export type DeezerArtist = {
	id: string | number;
	name: string;
	picture?: string;
	picture_medium?: string;
	picture_big?: string;
	nb_fan?: number;
};

export type DeezerAlbum = {
	id: string | number;
	title: string;
	cover?: string;
	cover_medium?: string;
	cover_big?: string;
	release_date?: string;
	nb_tracks?: number;
	duration?: number;
	fans?: number;
	record_type?: string;
	explicit_lyrics?: boolean;

	artist?: {
		id: string | number;
		name: string;
		picture_medium?: string;
	};

	tracks?: [DeezerTrack];
};

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
	const url = `${API_BASE_URL}${endpoint}`;

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
		data: data as T,
	};
}

export const api = {
	auth: {
		login: (email: string, password: string) =>
			fetchApi<{ user_id: string }>('/auth/login', {
				method: 'POST',
				body: JSON.stringify({
					mail: email,
					password,
				}),
			}),

		signup: (email: string, password: string, username: string) =>
			fetchApi<{ user_id: string }>('/auth/signup', {
				method: 'POST',
				body: JSON.stringify({
					mail: email,
					password,
					username,
				}),
			}),

		logout: () =>
			fetchApi<void>('/auth/logout', {
				method: 'POST',
			}),

		confirmMailAccount: (email: string, code: string) => {
			return fetchApi<{ success: boolean }>('/auth/confirm', {
				method: 'POST',
				body: JSON.stringify({
					mail: email,
					code,
				}),
			});
		},

		resetPassword: {
			request: (email: string) =>
				fetchApi<void>('/auth/reset-password/request', {
					method: 'POST',
					body: JSON.stringify({
						mail: email,
					}),
				}),

			verify: (email: string, code: string, password: string) =>
				fetchApi<void>('/auth/reset-password/verify', {
					method: 'POST',
					body: JSON.stringify({
						mail: email,
						code,
						password,
					}),
				}),
		},

		oauthFortyTwo: () => `${API_BASE_URL}/auth/oauth/oauth_fortytwo`,
	},

	deezer: {
		music: {
			top_music: (count: number) => {
				return fetchApi<DeezerTrack[]>(`/deezer/music/top_music?count=${count}`);
			},
			music: (music_deezer_id: number) => {
				return fetchApi<TrackPayload>(`/deezer/music/music?music_id=${music_deezer_id.toString()}`);
			},
		},
		album: {},
		search: (search: string, limit: number) => {
			return fetchApi<DeezerTrack[]>(`/deezer/search?q=${encodeURI(search)}&limit=${limit}`);
		},
	},
};
