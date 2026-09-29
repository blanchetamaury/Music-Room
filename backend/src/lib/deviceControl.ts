

export const PLAYBACK_COMMANDS = ['play', 'pause', 'next', 'previous', 'setQueue', 'skipTo', 'setVolume'] as const;

export type PlaybackCommand = (typeof PLAYBACK_COMMANDS)[number];

export const isPlaybackCommand = (value: string): value is PlaybackCommand =>
	(PLAYBACK_COMMANDS as readonly string[]).includes(value);

export type PlaybackStatusName = 'IDLE' | 'PLAYING' | 'PAUSED';

export interface PlaybackSnapshot {
	status: PlaybackStatusName;
	queue: string[];
	history: string[];
	currentTrackId: string | null;
	positionMs: number;
	volume: number;
}

export interface PlaybackCommandInput {
	command: PlaybackCommand;
	tracks?: string[];
	trackId?: string;
	volume?: number;
}

export class PlaybackCommandError extends Error {
	constructor(
		readonly code: 'EMPTY_QUEUE' | 'NO_HISTORY' | 'TRACK_NOT_IN_QUEUE' | 'INVALID_VOLUME' | 'MISSING_ARGUMENT',
		message: string
	) {
		super(message);
		this.name = 'PlaybackCommandError';
	}
}

const HISTORY_LIMIT = 50;

export const emptyPlaybackSnapshot = (): PlaybackSnapshot => ({
	status: 'IDLE',
	queue: [],
	history: [],
	currentTrackId: null,
	positionMs: 0,
	volume: 100,
});

const shiftQueue = (snapshot: PlaybackSnapshot): PlaybackSnapshot => {
	const history = snapshot.currentTrackId ? [...snapshot.history, snapshot.currentTrackId] : snapshot.history;
	const trimmed = history.slice(-HISTORY_LIMIT);

	const [head, ...rest] = snapshot.queue;
	if (head === undefined) {
		return { ...snapshot, status: 'IDLE', currentTrackId: null, positionMs: 0, history: trimmed };
	}

	return {
		...snapshot,
		queue: rest,
		history: trimmed,
		currentTrackId: head,
		positionMs: 0,
	};
};

const popHistory = (snapshot: PlaybackSnapshot): PlaybackSnapshot => {
	const target = snapshot.history[snapshot.history.length - 1];
	if (target === undefined) {
		throw new PlaybackCommandError('NO_HISTORY', 'No track to go back to');
	}

	const history = snapshot.history.slice(0, -1);
	const queue = [...snapshot.queue];
	const currentIndex = queue.indexOf(snapshot.currentTrackId ?? '');

	if (currentIndex >= 0) {
		queue.splice(currentIndex, 0, target);
	} else {
		queue.unshift(target);
	}

	return {
		...snapshot,
		queue,
		history: snapshot.currentTrackId ? [...history, snapshot.currentTrackId].slice(-HISTORY_LIMIT) : history,
		currentTrackId: target,
		positionMs: 0,
	};
};

export const applyPlaybackCommand = (snapshot: PlaybackSnapshot, input: PlaybackCommandInput): PlaybackSnapshot => {
	switch (input.command) {
		case 'play': {
			if (!snapshot.currentTrackId && snapshot.queue.length === 0) {
				throw new PlaybackCommandError('EMPTY_QUEUE', 'Cannot play with an empty queue');
			}
			return { ...snapshot, status: 'PLAYING' };
		}

		case 'pause': {
			if (snapshot.status === 'IDLE') {
				throw new PlaybackCommandError('EMPTY_QUEUE', 'Cannot pause a device with no playback');
			}
			return { ...snapshot, status: 'PAUSED' };
		}

		case 'next':
			return shiftQueue(snapshot);

		case 'previous':
			return popHistory(snapshot);

		case 'setQueue': {
			const tracks = input.tracks ?? [];
			if (tracks.length === 0) {
				throw new PlaybackCommandError('EMPTY_QUEUE', 'Cannot set an empty queue');
			}
			const current = snapshot.currentTrackId;
			return {
				...snapshot,
				queue: current ? [...tracks] : [...tracks.slice(1)],
				currentTrackId: current ?? tracks[0],
			};
		}

		case 'skipTo': {
			const target = input.trackId;
			if (!target) throw new PlaybackCommandError('MISSING_ARGUMENT', 'skipTo requires a trackId');
			const index = snapshot.queue.indexOf(target);
			if (index === -1) {
				throw new PlaybackCommandError('TRACK_NOT_IN_QUEUE', 'Track is not in the queue');
			}
			return { ...shiftQueue({ ...snapshot, queue: snapshot.queue.slice(index) }), currentTrackId: target };
		}

		case 'setVolume': {
			if (typeof input.volume !== 'number' || !Number.isInteger(input.volume)) {
				throw new PlaybackCommandError('MISSING_ARGUMENT', 'setVolume requires an integer volume');
			}
			if (input.volume < 0 || input.volume > 100) {
				throw new PlaybackCommandError('INVALID_VOLUME', 'Volume must be between 0 and 100');
			}
			return { ...snapshot, volume: input.volume };
		}

		default: {
			const exhaustive: never = input.command;
			throw new PlaybackCommandError('MISSING_ARGUMENT', `Unsupported command ${String(exhaustive)}`);
		}
	}
};
