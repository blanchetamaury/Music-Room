import { isPreviewExpired, previewExpiryMs, toPlayerTrack, toPlayableQueue } from './PlayerTrack';

const albumTrack = {
	id: 'internal-1',
	deezerCUID: 'cuid-1',
	title: 'Nightcall',
	duration: 234,
	previewUrl: 'https://cdn.deezer.com/preview-1.mp3',
	artists: [{ name: 'Kavinsky' }],
	album: { coverMedium: 'https://cdn.deezer.com/cover-1.jpg', cover: null },
};

const rawDeezerTrack = {
	deezerCUID: 'cuid-2',
	title: 'Odd Look',
	duration: 200,
	previewUrl: 'https://cdn.deezer.com/preview-2.mp3',
	artist: [{ name: 'Kavinsky' }],
	album: { CoverMedium: 'https://cdn.deezer.com/cover-2.jpg', CoverSmall: null },
};

describe('toPlayerTrack', () => {
	it('normalises a stored track', () => {
		expect(toPlayerTrack(albumTrack)).toEqual({
			id: 'internal-1',
			deezerCUID: 'cuid-1',
			title: 'Nightcall',
			artist: 'Kavinsky',
			cover: 'https://cdn.deezer.com/cover-1.jpg',
			previewUrl: 'https://cdn.deezer.com/preview-1.mp3',
			duration: 234,
		});
	});

	it('unwraps a playlist entry', () => {
		expect(toPlayerTrack({ track: albumTrack })?.title).toBe('Nightcall');
	});

	it('falls back to the Deezer CUID when there is no internal id', () => {
		const result = toPlayerTrack(rawDeezerTrack);
		expect(result?.id).toBe('cuid-2');
		expect(result?.artist).toBe('Kavinsky');
		expect(result?.cover).toBe('https://cdn.deezer.com/cover-2.jpg');
	});

	it('keeps a track with no preview but reports it as unplayable', () => {
		const result = toPlayerTrack({ ...albumTrack, previewUrl: null });
		expect(result).not.toBeNull();
		expect(result?.previewUrl).toBeNull();
	});

	it('falls back to a placeholder artist and a null cover', () => {
		const result = toPlayerTrack({ ...albumTrack, artists: [], album: null });
		expect(result?.artist).toBe('Unknown artist');
		expect(result?.cover).toBeNull();
	});

	it('rejects payloads with no usable identity or title', () => {
		expect(toPlayerTrack({ title: 'Nameless' })).toBeNull();
		expect(toPlayerTrack({ deezerCUID: 'x' })).toBeNull();
	});

	it('rejects empty or malformed input instead of throwing', () => {
		expect(toPlayerTrack(null)).toBeNull();
		expect(toPlayerTrack(undefined)).toBeNull();
		expect(toPlayerTrack('a string')).toBeNull();
		expect(toPlayerTrack({})).toBeNull();
		expect(toPlayerTrack({ track: null })).toBeNull();
	});
});

describe('toPlayableQueue', () => {
	it('drops unplayable tracks and preserves order', () => {
		const queue = toPlayableQueue([
			albumTrack,
			{ ...albumTrack, id: 'internal-2', title: 'No preview', previewUrl: null },
			{ ...albumTrack, id: 'internal-3', title: 'OutRun' },
		]);

		expect(queue.map((track) => track.title)).toEqual(['Nightcall', 'OutRun']);
	});

	it('returns an empty queue when nothing can be played', () => {
		expect(toPlayableQueue([{ ...albumTrack, previewUrl: null }])).toEqual([]);
		expect(toPlayableQueue([])).toEqual([]);
	});
});

const signed = (exp: number) =>
	`https://cdnt-preview.dzcdn.net/api/1/1/a/b/c/hash.mp3?hdnea=exp=${exp}~acl=/api/*~hmac=deadbeef`;

describe('previewExpiryMs', () => {
	it('reads the exp parameter as an absolute time', () => {
		expect(previewExpiryMs(signed(1_700_000_000))).toBe(1_700_000_000_000);
	});

	it('returns null when there is no exp to read', () => {
		expect(previewExpiryMs('https://example.com/track.mp3')).toBeNull();
		expect(previewExpiryMs(null)).toBeNull();
		expect(previewExpiryMs(undefined)).toBeNull();
	});

	it('does not read a digit prefix of a malformed value as the expiry', () => {
		expect(previewExpiryMs('https://example.com/a.mp3?hdnea=exp=1e999~hmac=x')).toBeNull();
	});

	it('reads an exp delimited by & or end of string', () => {
		expect(previewExpiryMs('https://example.com/a.mp3?exp=1700000000&x=1')).toBe(1_700_000_000_000);
		expect(previewExpiryMs('https://example.com/a.mp3?exp=1700000000')).toBe(1_700_000_000_000);
	});
});

describe('isPreviewExpired', () => {
	const now = 1_700_000_000_000;

	it('is not expired while exp is in the future', () => {
		expect(isPreviewExpired(signed(1_700_000_001), now)).toBe(false);
	});

	it('is expired once exp has passed', () => {
		expect(isPreviewExpired(signed(1_699_999_999), now)).toBe(true);
	});

	it('treats exp equal to now as expired', () => {
		expect(isPreviewExpired(signed(1_700_000_000), now)).toBe(true);
	});

	it('treats a URL without an exp as stale', () => {
		expect(isPreviewExpired('https://example.com/track.mp3', now)).toBe(true);
	});

	it('treats a malformed exp as stale rather than trusting it', () => {
		expect(isPreviewExpired('https://example.com/a.mp3?hdnea=exp=1e999~hmac=x', now)).toBe(true);
	});
});
