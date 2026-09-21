import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { unwrapApiResponse } from './helpers';

export const userQueryKeys = {
	all: ['user'] as const,
	me: (token: string) => ['user', 'me', token] as const,
	playlists: (token: string) => ['user', 'playlists', token] as const,
	likes: (token: string) => ['user', 'likes', token] as const,
	like: (token: string, trackId: string) => ['user', 'like', token, trackId] as const,
};

export function useMeQuery(token: string | null) {
	return useQuery({
		queryKey: userQueryKeys.me(token ?? ''),
		queryFn: () => api.user.me(token ?? '').then(unwrapApiResponse),
		enabled: Boolean(token),
	});
}

export function usePlaylistsInfiniteQuery(token: string | null) {
	return useInfiniteQuery({
		queryKey: userQueryKeys.playlists(token ?? ''),
		initialPageParam: 1,
		queryFn: ({ pageParam }) => api.user.playlist.playlists(token ?? '', pageParam).then(unwrapApiResponse),
		getNextPageParam: (lastPage) => (lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined),
		enabled: Boolean(token),
	});
}

export function useLikesQuery(token: string | null) {
	return useQuery({
		queryKey: userQueryKeys.likes(token ?? ''),
		queryFn: () => api.user.like.likes(token ?? '').then(unwrapApiResponse),
		enabled: Boolean(token),
	});
}

export function useLikeQuery(token: string | null, trackId: string | null) {
	return useQuery({
		queryKey: userQueryKeys.like(token ?? '', trackId ?? ''),
		queryFn: () => api.user.like.like(trackId ?? '', token ?? '').then(unwrapApiResponse),
		enabled: Boolean(token && trackId),
	});
}

export function useCreatePlaylistMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			name,
			cover,
			description,
			privatePlaylist,
			token,
		}: {
			name: string;
			cover: string;
			description: string;
			privatePlaylist: boolean;
			token: string;
		}) => api.user.playlist.create(name, cover, description, privatePlaylist, token).then(unwrapApiResponse),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: userQueryKeys.playlists(variables.token) });
		},
	});
}

export function useAddMusicMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ token, playlistId, trackId }: { token: string; playlistId: string; trackId: string }) =>
			api.user.playlist.addMusic(token, playlistId, trackId).then(unwrapApiResponse),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: userQueryKeys.playlists(variables.token), refetchType: 'all' });
		},
	});
}

export function useManageLikeMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ token, trackId }: { token: string; trackId: string }) =>
			api.user.like.manage(trackId, token).then(unwrapApiResponse),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: userQueryKeys.likes(variables.token) });
			queryClient.invalidateQueries({ queryKey: userQueryKeys.like(variables.token, variables.trackId) });
		},
	});
}
