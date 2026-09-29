import { api } from './client';
import { Platform } from 'react-native';

const API_URL = 'http://localhost:3000/api';

const jsonResponse = (body: unknown, status = 200) =>
	Promise.resolve({
		ok: status >= 200 && status < 300,
		status,
		text: () => Promise.resolve(JSON.stringify(body)),
	} as Response);

let lastCall: { url: string; init: RequestInit } | null = null;

beforeEach(() => {
	lastCall = null;
	global.fetch = jest.fn(async (url: string, init: RequestInit) => {
		lastCall = { url: String(url), init };
		return jsonResponse({ success: true, data: { voted: true, voteCount: 3 } });
	}) as unknown as typeof fetch;
});

afterEach(() => {
	jest.clearAllMocks();
});

const body = () => JSON.parse(String(lastCall?.init.body ?? '{}'));
const headers = () => (lastCall?.init.headers ?? {}) as Record<string, string>;

describe('event vote client', () => {
	it('adds a vote with PUT and returns the authoritative count', async () => {
		const result = await api.user.event.vote('tok', 'event-1', 'track-1');

		expect(lastCall?.url).toBe(`${API_URL}/user/event/vote`);
		expect(lastCall?.init.method).toBe('PUT');
		expect(body()).toEqual({ eventId: 'event-1', trackId: 'track-1' });
		expect(result).toEqual({ success: true, data: { voted: true, voteCount: 3 }, status: 200 });
	});

	it('removes a vote with DELETE', async () => {
		await api.user.event.removeVote('tok', 'event-1', 'track-1');

		expect(lastCall?.init.method).toBe('DELETE');
		expect(body()).toEqual({ eventId: 'event-1', trackId: 'track-1' });
	});

	it('sends the position when the event requires it', async () => {
		await api.user.event.vote('tok', 'event-1', 'track-1', { latitude: 48.8566, longitude: 2.3522 });

		expect(body()).toEqual({
			eventId: 'event-1',
			trackId: 'track-1',
			latitude: 48.8566,
			longitude: 2.3522,
		});
	});

	it('omits the position entirely when there is none', async () => {
		await api.user.event.vote('tok', 'event-1', 'track-1', undefined);

		expect(body()).toEqual({ eventId: 'event-1', trackId: 'track-1' });
		expect(body()).not.toHaveProperty('latitude');
	});

	it('sends the bearer token and the client type', async () => {
		await api.user.event.vote('tok', 'event-1', 'track-1');

		expect(headers().Authorization).toBe('Bearer tok');
		expect(headers()['X-Client-Type']).toBe(Platform.OS === 'web' ? 'web' : Platform.OS);
	});

	it('surfaces a server rejection as an unsuccessful response', async () => {
		global.fetch = jest.fn(async () =>
			jsonResponse({ success: false, message: 'Voting is closed for this event' }, 403)
		) as unknown as typeof fetch;

		const result = await api.user.event.vote('tok', 'event-1', 'track-1');
		expect(result.success).toBe(false);
		expect(result.message).toBe('Voting is closed for this event');
	});

	it('reports a network failure instead of throwing', async () => {
		global.fetch = jest.fn(async () => {
			throw new Error('Network request failed');
		}) as unknown as typeof fetch;

		const result = await api.user.event.vote('tok', 'event-1', 'track-1');
		expect(result).toEqual({ success: false, message: 'Network request failed' });
	});

	it('survives a non-JSON error body', async () => {
		global.fetch = jest.fn(async () =>
			Promise.resolve({
				ok: false,
				status: 502,
				text: () => Promise.resolve('<html>bad gateway</html>'),
			} as Response)
		) as unknown as typeof fetch;

		const result = await api.user.event.vote('tok', 'event-1', 'track-1');
		expect(result.success).toBe(false);
		expect(result.message).toBe('HTTP error 502');
	});
});
