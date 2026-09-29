import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AudioPlayer, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { PlayerProvider, PreviewUnavailableError, TrackResolver, usePlayer } from './PlayerContext';

jest.mock('expo-audio', () => ({
	useAudioPlayer: jest.fn(),
	useAudioPlayerStatus: jest.fn(),
	setAudioModeAsync: jest.fn(() => Promise.resolve()),
}));

const player = {
	play: jest.fn(),
	pause: jest.fn(),
	replace: jest.fn(),
	seekTo: jest.fn(),
} as unknown as AudioPlayer;

let status: {
	duration: number;
	currentTime: number;
	playing: boolean;
	isBuffering: boolean;
	didJustFinish: boolean;
};

const useAudioPlayerMock = useAudioPlayer as jest.MockedFunction<typeof useAudioPlayer>;
const useAudioPlayerStatusMock = useAudioPlayerStatus as jest.MockedFunction<typeof useAudioPlayerStatus>;

beforeEach(() => {
	jest.clearAllMocks();
	status = { duration: 30, currentTime: 0, playing: false, isBuffering: false, didJustFinish: false };
	useAudioPlayerMock.mockReturnValue(player);
	useAudioPlayerStatusMock.mockImplementation(() => status as never);
});

const renderPlayer = (resolveTrack?: TrackResolver) =>
	renderHook(() => usePlayer(), {
		wrapper: ({ children }) => <PlayerProvider resolveTrack={resolveTrack}>{children}</PlayerProvider>,
	});

const signedPreview = (exp: number) =>
	`https://cdnt-preview.dzcdn.net/api/1/1/a/b/c/hash.mp3?hdnea=exp=${exp}~acl=/api/*~hmac=deadbeef`;

const FUTURE = Math.floor(Date.now() / 1000) + 3600;
const PAST = Math.floor(Date.now() / 1000) - 3600;

const queueEntry = (id: string, deezerCUID: string, previewUrl: string) => ({
	track: {
		id,
		deezerCUID,
		title: `Track ${id}`,
		duration: 30,
		previewUrl,
		artists: [{ name: 'Artist' }],
		album: { coverMedium: null },
	},
});

describe('PlayerContext seek', () => {
	it.each([
		['NaN duration', Number.NaN],
		['Infinity duration', Number.POSITIVE_INFINITY],
		['zero duration', 0],
		['negative duration', -1],
	])('ignores a seek with %s', (_label, duration) => {
		status.duration = duration;
		const { result } = renderPlayer();

		act(() => result.current.seek(0.5));

		expect(player.seekTo).not.toHaveBeenCalled();
	});

	it.each([
		['NaN', Number.NaN],
		['Infinity', Number.POSITIVE_INFINITY],
		['-Infinity', Number.NEGATIVE_INFINITY],
		['undefined', undefined as unknown as number],
	])('ignores a seek with a %s ratio', (_label, ratio) => {
		const { result } = renderPlayer();

		act(() => result.current.seek(ratio));

		expect(player.seekTo).not.toHaveBeenCalled();
	});

	it('seeks to the matching second for a valid ratio', () => {
		const { result } = renderPlayer();

		act(() => result.current.seek(0.5));

		expect(player.seekTo).toHaveBeenCalledWith(15);
	});

	it('clamps a ratio outside 0..1', () => {
		const { result } = renderPlayer();

		act(() => result.current.seek(4));
		expect(player.seekTo).toHaveBeenLastCalledWith(30);

		act(() => result.current.seek(-2));
		expect(player.seekTo).toHaveBeenLastCalledWith(0);
	});

	it('never exposes a NaN progress or time while metadata is loading', () => {
		status.duration = Number.NaN;
		status.currentTime = Number.NaN;
		const { result } = renderPlayer();

		expect(result.current.progress).toBe(0);
		expect(result.current.positionSeconds).toBe(0);
		expect(result.current.durationSeconds).toBe(0);
	});
});

describe('expired preview refresh', () => {
	it('plays a still-valid preview without asking the backend', () => {
		const resolveTrack = jest.fn();
		const { result } = renderPlayer(resolveTrack);

		act(() => result.current.playQueue([queueEntry('a', '1', signedPreview(FUTURE))]));

		expect(resolveTrack).not.toHaveBeenCalled();
		expect(player.replace).toHaveBeenCalledWith({ uri: signedPreview(FUTURE) });
	});

	it('re-fetches a preview that has expired and plays the fresh URL', async () => {
		const freshUrl = signedPreview(Date.now() / 1000 + 7200);
		const resolveTrack = jest.fn().mockResolvedValue(queueEntry('a', '1', freshUrl).track);
		const { result } = renderPlayer(resolveTrack);

		await act(async () => {
			result.current.playQueue([queueEntry('a', '1', signedPreview(PAST))]);
		});

		expect(resolveTrack).toHaveBeenCalledWith('1');
		await waitFor(() => expect(player.replace).toHaveBeenCalledWith({ uri: freshUrl }));
	});

	it('stores the fresh URL in the queue so next/previous do not re-expire', async () => {
		const freshUrl = signedPreview(Date.now() / 1000 + 7200);
		const resolveTrack = jest.fn().mockResolvedValue(queueEntry('a', '1', freshUrl).track);
		const { result } = renderPlayer(resolveTrack);

		await act(async () => {
			result.current.playQueue([queueEntry('a', '1', signedPreview(PAST))]);
		});

		await waitFor(() => expect(result.current.currentTrack?.previewUrl).toBe(freshUrl));
	});

	it('does not retry a track the provider says has no preview at all', async () => {
		const resolveTrack = jest.fn().mockRejectedValue(new PreviewUnavailableError('no preview in your region'));
		const { result } = renderPlayer(resolveTrack);

		await act(async () => {
			result.current.playQueue([queueEntry('a', '1', signedPreview(PAST))]);
		});

		expect(result.current.notice).toMatch(/no longer offers a preview/i);
		expect(player.replace).not.toHaveBeenCalled();

		await act(async () => {
			result.current.playQueue([queueEntry('a', '1', signedPreview(PAST))]);
		});
		expect(resolveTrack).toHaveBeenCalledTimes(1);
	});

	it('keeps a transient failure retryable and does not start playback', async () => {
		const resolveTrack = jest.fn().mockRejectedValue(new Error('provider is temporarily unavailable'));
		const { result } = renderPlayer(resolveTrack);

		await act(async () => {
			result.current.playQueue([queueEntry('a', '1', signedPreview(PAST))]);
		});

		expect(result.current.notice).toMatch(/could not refresh/i);
		expect(player.replace).not.toHaveBeenCalled();

		resolveTrack.mockResolvedValue(queueEntry('a', '1', signedPreview(FUTURE)).track);
		await act(async () => {
			result.current.playQueue([queueEntry('a', '1', signedPreview(PAST))]);
		});
		expect(resolveTrack).toHaveBeenCalledTimes(2);
	});

	it('reports the problem when an expired preview has no Deezer id to refresh from', async () => {
		const resolveTrack = jest.fn();
		const { result } = renderPlayer(resolveTrack);

		await act(async () => {
			result.current.playQueue([{ track: { id: 'a', title: 'No id', previewUrl: signedPreview(PAST) } }]);
		});

		expect(resolveTrack).not.toHaveBeenCalled();
		expect(player.replace).not.toHaveBeenCalled();
		expect(result.current.notice).toMatch(/cannot be refreshed/i);
	});

	it('drops a track with no preview instead of queueing it', async () => {
		const resolveTrack = jest.fn();
		const { result } = renderPlayer(resolveTrack);

		await act(async () => {
			result.current.playQueue([{ track: { id: 'a', title: 'Silent', previewUrl: null } }]);
		});

		expect(resolveTrack).not.toHaveBeenCalled();
		expect(player.replace).not.toHaveBeenCalled();
		expect(result.current.notice).toMatch(/does not publish a preview/i);
	});
});
