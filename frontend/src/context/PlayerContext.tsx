import { api } from '@/src/lib/fetcher/api/client';
import { isPreviewExpired, PlayerTrack, toPlayableQueue, toPlayerTrack } from '@/src/types/player/PlayerTrack';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

interface PlayerContextValue {
	currentTrack: PlayerTrack | null;
	queue: PlayerTrack[];
	isPlaying: boolean;
	isBuffering: boolean;
	progress: number;
	positionSeconds: number;
	durationSeconds: number;
	notice: string | null;
	isRefreshing: boolean;
	playQueue: (queue: readonly unknown[], startIndex?: number) => void;
	toggle: () => void;
	play: () => void;
	pause: () => void;
	next: () => void;
	previous: () => void;
	seek: (ratio: number) => void;
	dismissNotice: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export type TrackResolver = (deezerCUID: string) => Promise<unknown>;

export class PreviewUnavailableError extends Error {}

const resolveViaApi: TrackResolver = async (deezerCUID) => {
	const response = await api.deezer.music.music(deezerCUID);
	if (!response.success) {
		const message = response.message ?? 'Could not refresh the track';
		if (response.status === 422) throw new PreviewUnavailableError(message);
		throw new Error(message);
	}
	return response.data;
};

interface PlaybackState {
	tracks: PlayerTrack[];
	index: number;
}

export function PlayerProvider({
	children,
	resolveTrack = resolveViaApi,
}: {
	children: ReactNode;
	resolveTrack?: TrackResolver;
}) {
	const player = useAudioPlayer();
	const status = useAudioPlayerStatus(player);
	const [{ tracks: queue, index }, setPlayback] = useState<PlaybackState>({
		tracks: [],
		index: -1,
	});
	const [notice, setNotice] = useState<string | null>(null);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const refreshFailedFor = useRef<Set<string>>(new Set());

	const advancedFor = useRef<string | null>(null);

	const loadToken = useRef(0);
	const pendingPlay = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false }).catch(() => {
		});

		return () => {
			if (pendingPlay.current) clearTimeout(pendingPlay.current);
		};
	}, []);
	const PLAY_AFTER_REPLACE_MS = 60;

	const startTrack = useCallback(
		(nextQueue: PlayerTrack[], nextIndex: number, previewUrl: string, token: number) => {
			player.replace({ uri: previewUrl });
			setPlayback({ tracks: nextQueue, index: nextIndex });
			advancedFor.current = null;

			if (pendingPlay.current) clearTimeout(pendingPlay.current);
			pendingPlay.current = setTimeout(() => {
				pendingPlay.current = null;
				if (token !== loadToken.current) return;
				try {
					void Promise.resolve(player.play()).catch(() => undefined);
				} catch {
				}
			}, PLAY_AFTER_REPLACE_MS);
		},
		[player]
	);
	const loadWithFreshPreview = useCallback(
		async (nextQueue: PlayerTrack[], nextIndex: number, token: number) => {
			const track = nextQueue[nextIndex];
			if (!track?.deezerCUID) {
				setNotice('This track expired and cannot be refreshed.');
				return;
			}

			setIsRefreshing(true);
			try {
				const fresh = toPlayerTrack(await resolveTrack(track.deezerCUID));

				if (!fresh?.previewUrl) {
					refreshFailedFor.current.add(track.id);
					setNotice('Deezer no longer offers a preview for this track.');
					return;
				}

				if (token !== loadToken.current) return;

				const patched = nextQueue.map((entry) => (entry.id === track.id ? { ...entry, ...fresh } : entry));
				startTrack(patched, nextIndex, fresh.previewUrl, token);
			} catch (error) {
				if (error instanceof PreviewUnavailableError) refreshFailedFor.current.add(track.id);
				setNotice(
					error instanceof PreviewUnavailableError
						? 'Deezer no longer offers a preview for this track.'
						: 'Could not refresh this preview. Check your connection.'
				);
			} finally {
				if (token === loadToken.current) setIsRefreshing(false);
			}
		},
		[resolveTrack, startTrack]
	);

	const load = useCallback(
		(nextQueue: PlayerTrack[], nextIndex: number) => {
			const track = nextQueue[nextIndex];
			if (!track?.previewUrl) return;

			const token = ++loadToken.current;

			if (isPreviewExpired(track.previewUrl) && !refreshFailedFor.current.has(track.id)) {
				void loadWithFreshPreview(nextQueue, nextIndex, token);
				return;
			}

			startTrack(nextQueue, nextIndex, track.previewUrl, token);
		},
		[loadWithFreshPreview, startTrack]
	);

	const playQueue = useCallback(
		(rawQueue: readonly unknown[], startIndex = 0) => {
			const playable = toPlayableQueue(rawQueue);

			if (playable.length === 0) {
				setNotice(
					rawQueue.length === 0
						? 'This playlist is empty.'
						: 'Deezer does not publish a preview for these tracks.'
				);
				return;
			}

			const clamped = Math.max(0, Math.min(startIndex, rawQueue.length - 1));
			const target = toPlayerTrack(rawQueue[clamped]);
			const resolved = target ? playable.findIndex((track) => track.id === target.id) : -1;
			if (!target || resolved < 0) {
				setNotice('Deezer does not publish a preview for this track.');
				return;
			}

			setNotice(null);
			load(playable, resolved);
		},
		[load]
	);

	const step = useCallback(
		(delta: number) => {
			if (queue.length === 0) return;
			const nextIndex = (index + delta + queue.length) % queue.length;
			load(queue, nextIndex);
		},
		[index, load, queue]
	);

	const next = useCallback(() => step(1), [step]);
	const previous = useCallback(() => step(-1), [step]);

	const play = useCallback(() => {
		player.play();
	}, [player]);

	const pause = useCallback(() => {
		if (pendingPlay.current) {
			clearTimeout(pendingPlay.current);
			pendingPlay.current = null;
		}
		player.pause();
	}, [player]);

	const toggle = useCallback(() => {
		if (status.playing) {
			pause();
			return;
		}
		if (pendingPlay.current) {
			clearTimeout(pendingPlay.current);
			pendingPlay.current = null;
		}
		try {
			void Promise.resolve(player.play()).catch(() => undefined);
		} catch {
		}
	}, [pause, player, status.playing]);

	const seek = useCallback(
		(ratio: number) => {
			const duration = status.duration;
			if (!Number.isFinite(duration) || duration <= 0) return;
			if (!Number.isFinite(ratio)) return;

			const seconds = Math.max(0, Math.min(1, ratio)) * duration;
			if (!Number.isFinite(seconds)) return;

			void player.seekTo(seconds);
		},
		[player, status.duration]
	);

	useEffect(() => {
		if (!status.didJustFinish) return;
		const current = queue[index];
		if (!current || advancedFor.current === current.id) return;

		advancedFor.current = current.id;
		if (queue.length > 1) load(queue, (index + 1) % queue.length);
	}, [index, load, queue, status.didJustFinish]);

	const positionSeconds = Number.isFinite(status.currentTime) ? Math.max(0, status.currentTime) : 0;
	const durationSeconds = Number.isFinite(status.duration) ? Math.max(0, status.duration) : 0;
	const progress = durationSeconds > 0 ? Math.min(1, Math.max(0, positionSeconds / durationSeconds)) : 0;

	const value = useMemo<PlayerContextValue>(
		() => ({
			currentTrack: index >= 0 ? (queue[index] ?? null) : null,
			queue,
			isPlaying: status.playing,
			isBuffering: status.isBuffering,
			isRefreshing,
			progress,
			positionSeconds,
			durationSeconds,
			notice,
			playQueue,
			toggle,
			play,
			pause,
			next,
			previous,
			seek,
			dismissNotice: () => setNotice(null),
		}),
		[
			durationSeconds,
			index,
			isRefreshing,
			notice,
			next,
			pause,
			play,
			playQueue,
			positionSeconds,
			previous,
			progress,
			queue,
			seek,
			status.isBuffering,
			status.playing,
			toggle,
		]
	);

	return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
	const context = useContext(PlayerContext);
	if (!context) throw new Error('usePlayer must be used inside a PlayerProvider');
	return context;
}
