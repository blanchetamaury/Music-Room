import { SseConnection } from './sseConnection';
import type { RealtimeChange } from './sseDecoder';


class FakeXhr {
	static instances: FakeXhr[] = [];

	readyState = 0;
	responseText = '';
	status = 0;
	aborted = false;
	sent = false;

	onreadystatechange: (() => void) | null = null;
	onerror: (() => void) | null = null;
	onloadend: (() => void) | null = null;

	url = '';
	headers: Record<string, string> = {};

	constructor() {
		FakeXhr.instances.push(this);
	}

	open(_method: string, url: string) {
		this.url = url;
	}

	setRequestHeader(key: string, value: string) {
		this.headers[key] = value;
	}

	send() {
		this.sent = true;
	}

	abort() {
		this.aborted = true;
	}

	pushBody(text: string) {
		this.responseText += text;
		this.readyState = 3;
		this.onreadystatechange?.();
	}

	fail() {
		this.readyState = 4;
		this.onerror?.();
	}

	end() {
		this.readyState = 4;
		this.onloadend?.();
	}
}

const frame = (operation: string) =>
	`event: change\ndata: ${JSON.stringify({ topic: 'playlist', entityId: 'p1', operation })}\n\n`;

describe('SseConnection', () => {
	let changes: RealtimeChange[];
	let statuses: string[];
	let connection: SseConnection;

	beforeEach(() => {
		jest.useFakeTimers();
		FakeXhr.instances = [];
		changes = [];
		statuses = [];
		(global as unknown as { XMLHttpRequest: unknown }).XMLHttpRequest = FakeXhr;
		connection = new SseConnection({
			url: 'http://localhost:3000/api/stream?topic=playlist&entity_id=p1',
			token: 'tok',
			onChange: (c) => changes.push(c),
			onStatus: (s) => statuses.push(s),
			onResync: () =>
				changes.push({ topic: 'playlist', entityId: 'p1', operation: 'resync', at: new Date().toISOString() }),
		});
	});

	afterEach(() => {
		connection.stop();
		jest.useRealTimers();
	});

	const first = () => FakeXhr.instances[0];

	it('sends the bearer token, which EventSource could not', () => {
		connection.start();
		expect(first().url).toContain('topic=playlist');
		expect(first().headers.Authorization).toBe('Bearer tok');
		expect(first().headers.Accept).toBe('text/event-stream');
	});

	it('reports connecting then open once bytes arrive', () => {
		connection.start();
		expect(statuses).toEqual(['connecting']);
		first().pushBody(frame('track.added'));
		expect(statuses).toEqual(['connecting', 'open']);
	});

	it('decodes changes from a streamed body', () => {
		connection.start();
		first().pushBody(frame('track.added'));
		first().pushBody(frame('track.moved'));
		expect(changes.map((c) => c.operation)).toEqual(['track.added', 'track.moved']);
	});

	it('does not re-deliver bytes it already consumed', () => {
		connection.start();
		first().pushBody(frame('one'));
		first().readyState = 3;
		first().onreadystatechange?.();
		expect(changes).toHaveLength(1);
	});

	it('reassembles a frame split across two body updates', () => {
		connection.start();
		first().pushBody('event: change\ndata: {"topic":"playlist","entityId":"p1",');
		first().pushBody('"operation":"track.moved"}\n\n');
		expect(changes.map((c) => c.operation)).toEqual(['track.moved']);
	});

	it('reconnects with backoff after an error', () => {
		connection.start();
		first().pushBody(frame('one'));
		first().fail();

		expect(statuses).toContain('reconnecting');
		expect(FakeXhr.instances).toHaveLength(1);
		jest.advanceTimersByTime(2_000);
		expect(FakeXhr.instances.length).toBeGreaterThan(1);
	});

	it('reconnects after a clean end of stream', () => {
		connection.start();
		first().pushBody(frame('one'));
		first().end();
		jest.advanceTimersByTime(2_000);
		expect(FakeXhr.instances.length).toBeGreaterThan(1);
	});

	it('resyncs after a reconnect so missed changes are not lost', () => {
		connection.start();
		first().pushBody(frame('one'));
		first().fail();
		jest.advanceTimersByTime(2_000);

		const second = FakeXhr.instances[FakeXhr.instances.length - 1];
		second.pushBody(frame('two'));
		expect(changes.map((c) => c.operation)).toContain('resync');
	});

	it('backs off further on repeated failures', () => {
		connection.start();
		first().fail();
		jest.advanceTimersByTime(2_000);
		const countAfterFirst = FakeXhr.instances.length;
		FakeXhr.instances[countAfterFirst - 1].fail();
		jest.advanceTimersByTime(1_100);
		expect(FakeXhr.instances).toHaveLength(countAfterFirst);
		jest.advanceTimersByTime(2_500);
		expect(FakeXhr.instances.length).toBeGreaterThan(countAfterFirst);
	});

	it('reconnects when the heartbeat goes silent', () => {
		connection.start();
		first().pushBody(frame('one'));
		expect(FakeXhr.instances).toHaveLength(1);

		jest.advanceTimersByTime(41_000);
		expect(first().aborted).toBe(true);
		jest.advanceTimersByTime(2_000);
		expect(FakeXhr.instances.length).toBeGreaterThan(1);
	});

	it('is kept alive by heartbeat comments alone', () => {
		connection.start();
		first().pushBody(': ping\n\n');
		jest.advanceTimersByTime(20_000);
		expect(FakeXhr.instances).toHaveLength(1);
	});

	it('stops reconnecting once stopped', () => {
		connection.start();
		first().pushBody(frame('one'));
		connection.stop();
		first().fail();
		jest.advanceTimersByTime(60_000);
		expect(FakeXhr.instances).toHaveLength(1);
		expect(statuses[statuses.length - 1]).toBe('closed');
	});

	it('aborts the in-flight request on stop so the socket is freed', () => {
		connection.start();
		const xhr = first();
		connection.stop();
		expect(xhr.aborted).toBe(true);
	});
});
