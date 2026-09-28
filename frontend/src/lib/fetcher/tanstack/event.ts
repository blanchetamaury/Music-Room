import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { unwrapApiResponse, unwrapApiResponseVoid } from './helpers';
import type { GeoPosition, MusicEvent } from '@/src/types/event/MusicEvent';

export const eventQueryKeys = {
	all: ['event'] as const,
	events: (token: string) => ['event', 'list', token] as const,
	event: (token: string, eventId: string) => ['event', token, eventId] as const,
};

export function useEventsQuery(token: string | null) {
	return useInfiniteQuery({
		queryKey: eventQueryKeys.events(token ?? ''),
		initialPageParam: 1,
		queryFn: ({ pageParam }) => api.user.event.events(token ?? '', pageParam).then(unwrapApiResponse),
		getNextPageParam: (lastPage) => (lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined),
		enabled: Boolean(token),
	});
}

export function useEventQuery(token: string | null, eventId: string | null) {
	return useQuery({
		queryKey: eventQueryKeys.event(token ?? '', eventId ?? ''),
		queryFn: () => api.user.event.event(token ?? '', eventId ?? '').then(unwrapApiResponse),
		enabled: Boolean(token && eventId),
	});
}

export function useCreateEventMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			token,
			name,
			description,
			visibility = 'PUBLIC',
			votingPolicy = 'EVERYONE',
		}: {
			token: string;
			name: string;
			description?: string;
			visibility?: 'PUBLIC' | 'PRIVATE';
			votingPolicy?: 'EVERYONE' | 'INVITED_ONLY' | 'LOCATION_TIME';
		}) => api.user.event.create(token, { name, description, visibility, votingPolicy }).then(unwrapApiResponse),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: eventQueryKeys.events(variables.token) });
		},
	});
}

export function useAddEventTrackMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ token, eventId, trackId }: { token: string; eventId: string; trackId: string }) =>
			api.user.event.addTrack(token, eventId, trackId).then(unwrapApiResponseVoid),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: eventQueryKeys.event(variables.token, variables.eventId) });
		},
	});
}

export function useVoteEventTrackMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			token,
			eventId,
			trackId,
			voted,
			position,
		}: {
			token: string;
			eventId: string;
			trackId: string;
			voted: boolean;
			position?: GeoPosition;
		}) => {
			const call = voted
				? api.user.event.removeVote(token, eventId, trackId, position)
				: api.user.event.vote(token, eventId, trackId, position);
			return call.then(unwrapApiResponse);
		},
		onSuccess: (result, variables) => {
			queryClient.setQueriesData<MusicEvent>(
				{ queryKey: eventQueryKeys.event(variables.token, variables.eventId) },
				(previous) =>
					previous
						? {
								...previous,
								tracks: previous.tracks.map((track) =>
									track.trackId === variables.trackId
										? { ...track, votedByMe: result.voted, voteCount: result.voteCount }
										: track
								),
							}
						: previous
			);
			queryClient.invalidateQueries({ queryKey: eventQueryKeys.event(variables.token, variables.eventId) });
		},
	});
}
