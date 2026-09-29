import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { unwrapApiResponse, unwrapApiResponseVoid } from './helpers';

export const userQueryKeys = {
	all: ['user'] as const,
	me: (token: string) => ['user', 'me', token] as const,
	playlists: (token: string, visibility?: string) => ['user', 'playlists', token, visibility ?? 'all'] as const,
	playlist: (token: string, playlistId: string) => ['user', 'playlist', token, playlistId] as const,
	members: (token: string, playlistId: string) => ['user', 'playlist', token, playlistId, 'members'] as const,
	likes: (token: string) => ['user', 'likes', token] as const,
	like: (token: string, trackId: string) => ['user', 'like', token, trackId] as const,
};

export function useMeQuery(token: string | null) {
	return useQuery({
		queryKey: userQueryKeys.me(token ?? ''),
		queryFn: () => api.user.me(token ?? '').then(unwrapApiResponse),
		enabled: Boolean(token),
		staleTime: 60_000,
	});
}

export function usePlaylistsInfiniteQuery(token: string | null, visibility?: 'PUBLIC' | 'PRIVATE') {
	return useInfiniteQuery({
		queryKey: userQueryKeys.playlists(token ?? '', visibility),
		initialPageParam: 1,
		queryFn: ({ pageParam }) =>
			api.user.playlist.playlists(token ?? '', pageParam, visibility).then(unwrapApiResponse),
		getNextPageParam: (lastPage) => (lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined),
		enabled: Boolean(token),
	});
}

export function usePlaylistQuery(token: string | null, playlistId: string | null) {
	return useQuery({
		queryKey: userQueryKeys.playlist(token ?? '', playlistId ?? ''),
		queryFn: () => api.user.playlist.playlist(token ?? '', playlistId ?? '').then(unwrapApiResponse),
		enabled: Boolean(token && playlistId),
	});
}

export function usePlaylistMembersQuery(token: string | null, playlistId: string | null) {
	return useQuery({
		queryKey: userQueryKeys.members(token ?? '', playlistId ?? ''),
		queryFn: () => api.user.playlist.members(token ?? '', playlistId ?? '').then(unwrapApiResponse),
		enabled: Boolean(token && playlistId),
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

const usePlaylistInvalidation = () => {
	const queryClient = useQueryClient();

	return (token: string, playlistId?: string) => {
		queryClient.invalidateQueries({ queryKey: userQueryKeys.playlists(token) });
		if (playlistId) {
			queryClient.invalidateQueries({ queryKey: userQueryKeys.playlist(token, playlistId) });
			queryClient.invalidateQueries({ queryKey: userQueryKeys.members(token, playlistId) });
		}
	};
};

export function useCreatePlaylistMutation() {
	const invalidate = usePlaylistInvalidation();

	return useMutation({
		mutationFn: ({
			token,
			name,
			cover,
			description,
			visibility = 'PUBLIC',
			editPolicy = 'EVERYONE',
		}: {
			token: string;
			name: string;
			cover?: string | null;
			description?: string;
			visibility?: 'PUBLIC' | 'PRIVATE';
			editPolicy?: 'EVERYONE' | 'INVITED_ONLY';
		}) =>
			api.user.playlist
				.create({ token, name, cover, description, visibility, editPolicy })
				.then(unwrapApiResponse),
		onSuccess: (_data, variables) => invalidate(variables.token),
	});
}

export function useUpdatePlaylistMutation() {
	const invalidate = usePlaylistInvalidation();

	return useMutation({
		mutationFn: ({
			token,
			playlistId,
			data,
		}: {
			token: string;
			playlistId: string;
			data: {
				name?: string;
				cover?: string | null;
				description?: string;
				visibility?: 'PUBLIC' | 'PRIVATE';
				editPolicy?: 'EVERYONE' | 'INVITED_ONLY';
				expectedVersion?: number;
			};
		}) => api.user.playlist.update(token, playlistId, data).then(unwrapApiResponseVoid),
		onSuccess: (_data, variables) => invalidate(variables.token, variables.playlistId),
	});
}

export function useDeletePlaylistMutation() {
	const invalidate = usePlaylistInvalidation();

	return useMutation({
		mutationFn: ({ token, playlistId }: { token: string; playlistId: string }) =>
			api.user.playlist.remove(token, playlistId).then(unwrapApiResponseVoid),
		onSuccess: (_data, variables) => invalidate(variables.token),
	});
}

export function useAddMusicMutation() {
	const invalidate = usePlaylistInvalidation();

	return useMutation({
		mutationFn: ({ token, playlistId, trackId }: { token: string; playlistId: string; trackId: string }) =>
			api.user.playlist.addMusic(token, playlistId, trackId).then(unwrapApiResponseVoid),
		onSuccess: (_data, variables) => invalidate(variables.token, variables.playlistId),
	});
}

export function useRemoveMusicMutation() {
	const invalidate = usePlaylistInvalidation();

	return useMutation({
		mutationFn: ({ token, playlistId, trackId }: { token: string; playlistId: string; trackId: string }) =>
			api.user.playlist.removeMusic(token, playlistId, trackId).then(unwrapApiResponseVoid),
		onSuccess: (_data, variables) => invalidate(variables.token, variables.playlistId),
	});
}

export function useInvitePlaylistMemberMutation() {
	const invalidate = usePlaylistInvalidation();

	return useMutation({
		mutationFn: ({
			token,
			playlistId,
			username,
			role = 'EDITOR',
		}: {
			token: string;
			playlistId: string;
			username: string;
			role?: 'EDITOR' | 'VIEWER';
		}) => api.user.playlist.inviteMember(token, playlistId, username, role).then(unwrapApiResponse),
		onSuccess: (_data, variables) => invalidate(variables.token, variables.playlistId),
	});
}

export function useRemovePlaylistMemberMutation() {
	const invalidate = usePlaylistInvalidation();

	return useMutation({
		mutationFn: ({ token, playlistId, userId }: { token: string; playlistId: string; userId: string }) =>
			api.user.playlist.removeMember(token, playlistId, userId).then(unwrapApiResponseVoid),
		onSuccess: (_data, variables) => invalidate(variables.token, variables.playlistId),
	});
}

export function useManageLikeMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ token, trackId }: { token: string; trackId: string }) =>
			api.user.like.manage(trackId, token).then(unwrapApiResponseVoid),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: userQueryKeys.likes(variables.token) });
			queryClient.invalidateQueries({ queryKey: userQueryKeys.like(variables.token, variables.trackId) });
		},
	});
}

export class VersionConflictError extends Error {
	constructor() {
		super('This playlist was modified by someone else.');
		this.name = 'VersionConflictError';
	}
}

export function useMoveTrackMutation() {
	const invalidate = usePlaylistInvalidation();

	return useMutation({
		mutationFn: ({
			token,
			playlistId,
			trackId,
			newPosition,
			expectedVersion,
		}: {
			token: string;
			playlistId: string;
			trackId: string;
			newPosition: number;
			expectedVersion?: number;
		}) =>
			api.user.playlist.moveTrack(token, playlistId, trackId, newPosition, expectedVersion).then((response) => {
				if (response.status === 409) throw new VersionConflictError();
				return unwrapApiResponse(response);
			}),
		onSuccess: (_data, variables) => invalidate(variables.token, variables.playlistId),
		onError: (_error, variables) => invalidate(variables.token, variables.playlistId),
	});
}
