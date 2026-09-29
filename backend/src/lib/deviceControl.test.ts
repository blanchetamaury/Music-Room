import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	applyPlaybackCommand,
	emptyPlaybackSnapshot,
	isPlaybackCommand,
	PlaybackCommandError,
	type PlaybackSnapshot,
} from './deviceControl';

const playing = (over: Partial<PlaybackSnapshot> = {}): PlaybackSnapshot => ({
	status: 'PLAYING',
	queue: ['b', 'c'],
	history: [],
	currentTrackId: 'a',
	positionMs: 4200,
	volume: 100,
	...over,
});

describe('applyPlaybackCommand / play', () => {
	it('starts playback without resetting the position', () => {
		const after = applyPlaybackCommand(playing({ status: 'PAUSED' }), { command: 'play' });
		assert.equal(after.status, 'PLAYING');
		assert.equal(after.positionMs, 4200);
	});

	it('starts the first queued track when nothing was playing yet', () => {
		const after = applyPlaybackCommand(
			playing({ status: 'IDLE', currentTrackId: null, queue: ['b', 'c'], positionMs: 0 }),
			{ command: 'play' }
		);
		assert.equal(after.status, 'PLAYING');
	});

	it('refuses to play with no track and an empty queue', () => {
		assert.throws(
			() => applyPlaybackCommand(emptyPlaybackSnapshot(), { command: 'play' }),
			(e: unknown) => {
				assert.ok(e instanceof PlaybackCommandError);
				assert.equal(e.code, 'EMPTY_QUEUE');
				return true;
			}
		);
	});

	it('never mutates the input snapshot', () => {
		const before = playing();
		applyPlaybackCommand(before, { command: 'next' });
		assert.deepEqual(before.queue, ['b', 'c']);
		assert.deepEqual(before.history, []);
		assert.equal(before.currentTrackId, 'a');
	});
});

describe('applyPlaybackCommand / pause', () => {
	it('pauses a playing device and keeps the position', () => {
		const after = applyPlaybackCommand(playing(), { command: 'pause' });
		assert.equal(after.status, 'PAUSED');
		assert.equal(after.positionMs, 4200);
	});

	it('refuses to pause an idle device instead of inventing a paused state', () => {
		assert.throws(
			() => applyPlaybackCommand(playing({ status: 'IDLE' }), { command: 'pause' }),
			PlaybackCommandError
		);
	});
});

describe('applyPlaybackCommand / next', () => {
	it('advances the queue and remembers the track it left', () => {
		const after = applyPlaybackCommand(playing(), { command: 'next' });
		assert.equal(after.currentTrackId, 'b');
		assert.deepEqual(after.queue, ['c']);
		assert.deepEqual(after.history, ['a']);
		assert.equal(after.positionMs, 0);
	});

	it('is a harmless no-op on an empty queue rather than an error', () => {
		const after = applyPlaybackCommand(emptyPlaybackSnapshot(), { command: 'next' });
		assert.equal(after.status, 'IDLE');
		assert.equal(after.currentTrackId, null);
		assert.deepEqual(after.queue, []);
	});

	it('goes IDLE and clears the track once the queue is exhausted', () => {
		const after = applyPlaybackCommand(playing({ queue: [], currentTrackId: 'z', history: [] }), {
			command: 'next',
		});
		assert.equal(after.status, 'IDLE');
		assert.equal(after.currentTrackId, null);
		assert.deepEqual(after.history, ['z']);
	});
});

describe('applyPlaybackCommand / previous', () => {
	it('goes back to the last played track and re-queues it in place', () => {
		const after = applyPlaybackCommand(playing({ queue: ['c'], currentTrackId: 'b', history: ['a'] }), {
			command: 'previous',
		});
		assert.equal(after.currentTrackId, 'a');
		assert.deepEqual(after.queue, ['a', 'c']);
		assert.deepEqual(after.history, ['b']);
	});

	it('walks back through repeated previous commands', () => {
		let state = playing({ queue: ['c'], currentTrackId: 'b', history: ['a'] });
		state = applyPlaybackCommand(state, { command: 'previous' });
		assert.equal(state.currentTrackId, 'a');
		state = applyPlaybackCommand(state, { command: 'previous' });
		assert.equal(state.currentTrackId, 'b');
		assert.deepEqual(state.history, ['a']);
	});

	it('refuses when there is no history', () => {
		assert.throws(
			() => applyPlaybackCommand(playing({ history: [] }), { command: 'previous' }),
			(e: unknown) => {
				assert.ok(e instanceof PlaybackCommandError);
				assert.equal(e.code, 'NO_HISTORY');
				return true;
			}
		);
	});
});

describe('applyPlaybackCommand / setQueue', () => {
	it('replaces the up-next list without stopping the current track', () => {
		const after = applyPlaybackCommand(playing(), { command: 'setQueue', tracks: ['x', 'y'] });
		assert.deepEqual(after.queue, ['x', 'y']);
		assert.equal(after.currentTrackId, 'a');
		assert.equal(after.status, 'PLAYING');
	});

	it('adopts the first track when nothing was playing', () => {
		const after = applyPlaybackCommand(playing({ status: 'IDLE', currentTrackId: null, queue: [], history: [] }), {
			command: 'setQueue',
			tracks: ['x', 'y'],
		});
		assert.equal(after.currentTrackId, 'x');
	});

	it('refuses an empty queue', () => {
		assert.throws(() => applyPlaybackCommand(playing(), { command: 'setQueue', tracks: [] }), PlaybackCommandError);
	});
});

describe('applyPlaybackCommand / skipTo', () => {
	it('jumps to a queued track and drops the ones before it', () => {
		const after = applyPlaybackCommand(playing({ queue: ['b', 'c', 'd'] }), { command: 'skipTo', trackId: 'c' });
		assert.equal(after.currentTrackId, 'c');
		assert.deepEqual(after.queue, ['d']);
	});

	it('refuses a track that is not queued', () => {
		assert.throws(
			() => applyPlaybackCommand(playing(), { command: 'skipTo', trackId: 'zz' }),
			(e: unknown) => {
				assert.ok(e instanceof PlaybackCommandError);
				assert.equal(e.code, 'TRACK_NOT_IN_QUEUE');
				return true;
			}
		);
	});
});

describe('applyPlaybackCommand / setVolume', () => {
	it('applies a valid level', () => {
		assert.equal(applyPlaybackCommand(playing(), { command: 'setVolume', volume: 30 }).volume, 30);
	});

	it('refuses an out of range level', () => {
		assert.throws(
			() => applyPlaybackCommand(playing(), { command: 'setVolume', volume: 140 }),
			(e: unknown) => {
				assert.ok(e instanceof PlaybackCommandError);
				assert.equal(e.code, 'INVALID_VOLUME');
				return true;
			}
		);
	});
});

describe('isPlaybackCommand', () => {
	it('accepts every documented command', () => {
		for (const command of ['play', 'pause', 'next', 'previous', 'setQueue', 'skipTo', 'setVolume']) {
			assert.equal(isPlaybackCommand(command), true);
		}
	});

	it('rejects anything else', () => {
		assert.equal(isPlaybackCommand('dropDatabase'), false);
		assert.equal(isPlaybackCommand(''), false);
	});
});
