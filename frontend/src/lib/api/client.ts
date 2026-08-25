import { ApiResponse } from "@/src/types/api/ApiResponse";
import { DeezerTrack } from "@/src/types/deezer/deezer";
import { privateUser } from "@/src/types/user/PrivateUser";
import { auth } from "./auth";
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

export async function fetchApi<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<ApiResponse<T>> {
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
		data: data as T,
	};
}

export const api = {
	auth: auth,
	user : {
		me: () => {
			return fetchApi<privateUser>(`/user/me`);
		}
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
