import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { SseConnection, type SseStatus } from './sseConnection';
import type { RealtimeChange } from './sseDecoder';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export type RealtimeTopic = 'playlist' | 'event' | 'device';

export interface UseRealtimeOptions {
	topic: RealtimeTopic;
	entityId: string | null;
	token: string | null;
	invalidate: (queryClient: ReturnType<typeof useQueryClient>, token: string) => void;
	ignoreOwnChanges?: boolean;
	enabled?: boolean;
}

export function useRealtimeSubscription({
	topic,
	entityId,
	token,
	invalidate,
	ignoreOwnChanges = false,
	enabled = true,
}: UseRealtimeOptions): { status: SseStatus; lastChange: RealtimeChange | null } {
	const queryClient = useQueryClient();
	const [status, setStatus] = useState<SseStatus>('idle');
	const [lastChange, setLastChange] = useState<RealtimeChange | null>(null);

	const invalidateRef = useRef(invalidate);
	const queryClientRef = useRef(queryClient);
	useEffect(() => {
		invalidateRef.current = invalidate;
		queryClientRef.current = queryClient;
	}, [invalidate, queryClient]);

	const active = Boolean(token && entityId && enabled);

	useEffect(() => {
		if (!active || !token || !entityId) return;

		const url = `${API_URL.replace(/\/api$/, '')}/api/stream?topic=${encodeURIComponent(topic)}&entity_id=${encodeURIComponent(entityId)}`;

		const connection = new SseConnection({
			url,
			token,
			onStatus: setStatus,
			onResync: () => invalidateRef.current(queryClientRef.current, token),
			onChange: (change) => {
				if (change.topic !== topic || change.entityId !== entityId) return;
				if (ignoreOwnChanges && change.actorId === token) return;
				setLastChange(change);
				invalidateRef.current(queryClientRef.current, token);
			},
		});

		connection.start();
		return () => connection.stop();
	}, [active, token, entityId, topic, ignoreOwnChanges]);

	return { status: active ? status : 'idle', lastChange };
}

export const realtimeInvalidation = {
	playlist: (queryClient: ReturnType<typeof useQueryClient>, token: string, playlistId: string) => {
		queryClient.invalidateQueries({ queryKey: ['user', 'playlist', token, playlistId] });
		queryClient.invalidateQueries({ queryKey: ['user', 'playlist', token, playlistId, 'members'] });
		queryClient.invalidateQueries({ queryKey: ['user', 'playlists', token] });
	},
	event: (queryClient: ReturnType<typeof useQueryClient>, token: string, eventId: string) => {
		queryClient.invalidateQueries({ queryKey: ['event', token, eventId] });
		queryClient.invalidateQueries({ queryKey: ['event', 'list', token] });
	},
	device: (queryClient: ReturnType<typeof useQueryClient>, token: string, deviceId: string) => {
		queryClient.invalidateQueries({ queryKey: ['device', token, deviceId] });
		queryClient.invalidateQueries({ queryKey: ['device', 'list', token] });
	},
};
