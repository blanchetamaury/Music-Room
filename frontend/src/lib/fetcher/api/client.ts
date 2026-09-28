import { Platform } from 'react-native';
import { outputAPIAlbum } from '@/src/types/album/album';
import { ApiResponse } from '@/src/types/api/ApiResponse';
import { OutputAlbumDeezer, OutputArtistDeezer, OutputTrackDeezer } from '@/src/types/deezer/OutputDeezerTrack';
import { PaginationResponse } from '@/src/types/pagination/PaginationResponse';
import { PlaylistOutput } from '@/src/types/playlist/PlaylistOutput';
import { Track } from '@/src/types/track/track';
import { privateUser } from '@/src/types/user/PrivateUser';
import { Like } from '@/src/types/user/like';
import { auth } from './auth';
import { getCsrfToken } from '../../storage';
import type { PlaylistMember, PlaylistMembersResponse } from '@/src/types/playlist/PlaylistMember';
import type { GeoPosition, MusicEvent, MusicEventSummary, VoteResult } from '@/src/types/event/MusicEvent';
import type { Device, DeviceDelegation, DevicePermission } from '@/src/types/device/Device';
import type { SessionExchangeResult } from '@/src/types/auth/SessionExchange';

export type { DeezerAlbum, DeezerArtist, DeezerTrack } from '@/src/types/deezer/deezer';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';
const REQUEST_TIMEOUT_MS = 15_000;

const clientType = Platform.OS === 'web' ? 'web' : Platform.OS === 'ios' ? 'ios' : 'android';

const buildHeaders = (options: RequestInit): HeadersInit => {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		'X-Client-Type': clientType,
	};

	const csrfToken = getCsrfToken();
	if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

	const extra = options.headers;
	if (extra) {
		if (extra instanceof Headers) {
			extra.forEach((value, key) => {
				headers[key] = value;
			});
		} else if (Array.isArray(extra)) {
			for (const [key, value] of extra) headers[key] = value;
		} else {
			Object.assign(headers, extra);
		}
	}

	return headers;
};

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		const response = await fetch(`${API_URL}${endpoint}`, {
			...options,
			headers: buildHeaders(options),
			credentials: 'include',
			signal: controller.signal,
		});

		const raw = await response.text();
		const data = raw ? safeJsonParse(raw) : {};

		if (!response.ok) {
			return {
				success: false,
				message: data?.message ?? `HTTP error ${response.status}`,
			};
		}

		return { success: true, data: (data?.data ?? undefined) as T, message: data?.message };
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			return { success: false, message: 'The request timed out. Please try again.' };
		}
		return {
			success: false,
			message: error instanceof Error ? error.message : 'Network error',
		};
	} finally {
		clearTimeout(timeout);
	}
}

function safeJsonParse(raw: string): { data?: unknown; message?: string } {
	try {
		return JSON.parse(raw) as { data?: unknown; message?: string };
	} catch {
		return {};
	}
}

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

export const api = {
	auth: {
		...auth,
		exchangeSession: (code: string) =>
			fetchApi<SessionExchangeResult>('/auth/session/exchange', {
				method: 'POST',
				body: JSON.stringify({ code }),
			}),

		confirmEmail: (token: string) =>
			fetchApi<void>('/auth/confirm', {
				method: 'POST',
				body: JSON.stringify({ token }),
			}),

		resendVerification: (mail: string) =>
			fetchApi<void>('/auth/resend-verification', {
				method: 'POST',
				body: JSON.stringify({ mail }),
			}),
	},

	user: {
		me: (token?: string) => fetchApi<privateUser>('/user/me', token ? { headers: authHeaders(token) } : {}),

		updateMe: (token: string, profile: { username?: string; avatarUrl?: string | null }) =>
			fetchApi<privateUser>('/user/me', {
				method: 'PATCH',
				body: JSON.stringify(profile),
				headers: authHeaders(token),
			}),

		playlist: {
			create: (params: {
				token: string;
				name: string;
				cover?: string | null;
				description?: string;
				visibility?: 'PUBLIC' | 'PRIVATE';
				editPolicy?: 'EVERYONE' | 'INVITED_ONLY';
			}) =>
				fetchApi<PlaylistOutput>('/user/playlist/create', {
					method: 'POST',
					body: JSON.stringify({
						name: params.name,
						cover: params.cover ?? undefined,
						description: params.description,
						visibility: params.visibility,
						editPolicy: params.editPolicy,
					}),
					headers: authHeaders(params.token),
				}),

			playlists: (token: string, pageParam = 1, visibility?: 'PUBLIC' | 'PRIVATE') => {
				const visibilityQuery = visibility ? `&visibility=${visibility}` : '';
				return fetchApi<PaginationResponse<PlaylistOutput>>(
					`/user/playlist/playlists?page=${pageParam}&limit=10${visibilityQuery}`,
					{ headers: authHeaders(token) }
				);
			},

			playlist: (token: string, playlistId: string) =>
				fetchApi<PlaylistOutput>(`/user/playlist/playlist?playlist_id=${encodeURIComponent(playlistId)}`, {
					headers: authHeaders(token),
				}),

			addMusic: (token: string, playlistId: string, trackId: string) =>
				fetchApi<void>('/user/playlist/addMusic', {
					method: 'POST',
					body: JSON.stringify({ playlistId, trackId }),
					headers: authHeaders(token),
				}),

			update: (
				token: string,
				playlistId: string,
				data: {
					name?: string;
					cover?: string | null;
					description?: string;
					visibility?: 'PUBLIC' | 'PRIVATE';
					editPolicy?: 'EVERYONE' | 'INVITED_ONLY';
					expectedVersion?: number;
				}
			) =>
				fetchApi<void>('/user/playlist/update', {
					method: 'PATCH',
					body: JSON.stringify({ playlistId, ...data }),
					headers: authHeaders(token),
				}),

			remove: (token: string, playlistId: string) =>
				fetchApi<void>(`/user/playlist/delete?playlist_id=${encodeURIComponent(playlistId)}`, {
					method: 'DELETE',
					headers: authHeaders(token),
				}),

			removeMusic: (token: string, playlistId: string, trackId: string) =>
				fetchApi<void>('/user/playlist/removeMusic', {
					method: 'DELETE',
					body: JSON.stringify({ playlistId, trackId }),
					headers: authHeaders(token),
				}),

			members: (token: string, playlistId: string) =>
				fetchApi<PlaylistMembersResponse>(
					`/user/playlist/members?playlist_id=${encodeURIComponent(playlistId)}`,
					{ headers: authHeaders(token) }
				),

			inviteMember: (token: string, playlistId: string, username: string, role: 'EDITOR' | 'VIEWER') =>
				fetchApi<PlaylistMember>('/user/playlist/members', {
					method: 'POST',
					body: JSON.stringify({ playlistId, username, role }),
					headers: authHeaders(token),
				}),

			removeMember: (token: string, playlistId: string, userId: string) =>
				fetchApi<void>('/user/playlist/members', {
					method: 'DELETE',
					body: JSON.stringify({ playlistId, userId, role: 'EDITOR' }),
					headers: authHeaders(token),
				}),

			acceptInvitation: (token: string, playlistId: string) =>
				fetchApi<void>('/user/playlist/members', {
					method: 'PATCH',
					body: JSON.stringify({ playlistId }),
					headers: authHeaders(token),
				}),
		},

		like: {
			manage: (trackId: string, token: string) =>
				fetchApi<void>(`/user/like/manage?track_id=${encodeURIComponent(trackId)}`, {
					method: 'POST',
					body: JSON.stringify({}),
					headers: authHeaders(token),
				}),
			like: (trackId: string, token: string) =>
				fetchApi<Like>(`/user/like/like?track_id=${encodeURIComponent(trackId)}`, {
					headers: authHeaders(token),
				}),
			likes: (token: string) => fetchApi<Like[]>('/user/like/likes', { headers: authHeaders(token) }),
		},

		event: {
			create: (
				token: string,
				data: {
					name: string;
					description?: string;
					visibility?: 'PUBLIC' | 'PRIVATE';
					votingPolicy?: 'EVERYONE' | 'INVITED_ONLY' | 'LOCATION_TIME';
					latitude?: number;
					longitude?: number;
					radius?: number;
					startAt?: string;
					endAt?: string;
				}
			) =>
				fetchApi<MusicEvent>('/user/event/create', {
					method: 'POST',
					body: JSON.stringify(data),
					headers: authHeaders(token),
				}),

			events: (token: string, pageParam = 1) =>
				fetchApi<PaginationResponse<MusicEventSummary>>(`/user/event/events?page=${pageParam}&limit=10`, {
					headers: authHeaders(token),
				}),

			event: (token: string, eventId: string) =>
				fetchApi<MusicEvent>(`/user/event/event?event_id=${encodeURIComponent(eventId)}`, {
					headers: authHeaders(token),
				}),

			addTrack: (token: string, eventId: string, trackId: string) =>
				fetchApi<void>('/user/event/track', {
					method: 'POST',
					body: JSON.stringify({ eventId, trackId }),
					headers: authHeaders(token),
				}),

			vote: (token: string, eventId: string, trackId: string, position?: GeoPosition) => {
				const body = JSON.stringify({ eventId, trackId, ...(position ?? {}) });
				return fetchApi<VoteResult>('/user/event/vote', {
					method: 'PUT',
					body,
					headers: authHeaders(token),
				});
			},

			removeVote: (token: string, eventId: string, trackId: string, position?: GeoPosition) => {
				const body = JSON.stringify({ eventId, trackId, ...(position ?? {}) });
				return fetchApi<VoteResult>('/user/event/vote', {
					method: 'DELETE',
					body,
					headers: authHeaders(token),
				});
			},
		},

		device: {
			register: (
				token: string,
				data: { deviceName: string; platform: 'ios' | 'android' | 'web'; appVersion: string }
			) =>
				fetchApi<Device>('/user/device/register', {
					method: 'POST',
					body: JSON.stringify(data),
					headers: authHeaders(token),
				}),

			devices: (token: string) => fetchApi<Device[]>('/user/device/devices', { headers: authHeaders(token) }),

			revoke: (token: string, deviceId: string) =>
				fetchApi<void>('/user/device/revoke', {
					method: 'POST',
					body: JSON.stringify({ deviceId }),
					headers: authHeaders(token),
				}),

			delegate: (token: string, data: DeviceDelegation) =>
				fetchApi<DevicePermission>('/user/device/delegate', {
					method: 'POST',
					body: JSON.stringify(data),
					headers: authHeaders(token),
				}),

			revokeDelegation: (token: string, deviceId: string, delegateUserId: string) =>
				fetchApi<void>('/user/device/delegate', {
					method: 'DELETE',
					body: JSON.stringify({ deviceId, delegateUserId, permission: 'CONTROL' }),
					headers: authHeaders(token),
				}),
		},
	},

	deezer: {
		music: {
			top_music: (count: number) => fetchApi<OutputTrackDeezer[]>(`/deezer/music/top_music?count=${count}`),
			music: (music_deezer_id: number) =>
				fetchApi<Track>(`/deezer/music/music?music_id=${music_deezer_id.toString()}`),
		},
		album: {
			album: (deezerCUID: string) =>
				fetchApi<outputAPIAlbum>(`/deezer/album/album?deezer_id=${encodeURIComponent(deezerCUID)}`),
		},
		artist: {
			artist: (deezerCUID: string) =>
				fetchApi<OutputArtistDeezer>(`/deezer/artist/artist?deezer_id=${encodeURIComponent(deezerCUID)}`),
			topTracks: (deezerCUID: string, limit = 25) =>
				fetchApi<OutputTrackDeezer[]>(
					`/deezer/artist/tracks?deezer_id=${encodeURIComponent(deezerCUID)}&limit=${limit}`
				),
			albums: (deezerCUID: string, limit = 25) =>
				fetchApi<OutputAlbumDeezer[]>(
					`/deezer/artist/albums?deezer_id=${encodeURIComponent(deezerCUID)}&limit=${limit}`
				),
		},
		search: (search: string, limit: number) =>
			fetchApi<OutputTrackDeezer[]>(`/deezer/search?q=${encodeURIComponent(search)}&limit=${limit}`),
	},
};
