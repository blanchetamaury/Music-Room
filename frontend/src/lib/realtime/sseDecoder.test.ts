import { SseDecoder, toRealtimeChange } from './sseDecoder';

describe('SseDecoder', () => {
	it('decodes a complete frame', () => {
		const frames = new SseDecoder().push('event: change\ndata: {"a":1}\n\n');
		expect(frames).toEqual([{ event: 'change', data: '{"a":1}' }]);
	});

	it('buffers a frame split across chunks', () => {
		const decoder = new SseDecoder();
		expect(decoder.push('event: chan')).toEqual([]);
		expect(decoder.push('ge\ndata: {"a":')).toEqual([]);
		expect(decoder.push('1}\n')).toEqual([]);
		expect(decoder.push('\n')).toEqual([{ event: 'change', data: '{"a":1}' }]);
	});

	it('decodes several frames from one chunk', () => {
		const frames = new SseDecoder().push('event: change\ndata: 1\n\nevent: change\ndata: 2\n\n');
		expect(frames.map((f) => f.data)).toEqual(['1', '2']);
	});

	it('ignores heartbeat comments', () => {
		expect(new SseDecoder().push(': ping\n\n')).toEqual([]);
		expect(new SseDecoder().push(': ping\n\nevent: change\ndata: x\n\n')).toEqual([{ event: 'change', data: 'x' }]);
	});

	it('normalises CRLF terminators', () => {
		expect(new SseDecoder().push('event: change\r\ndata: x\r\n\r\n')).toEqual([{ event: 'change', data: 'x' }]);
	});

	it('joins multi-line data fields', () => {
		expect(new SseDecoder().push('event: change\ndata: a\ndata: b\n\n')).toEqual([
			{ event: 'change', data: 'a\nb' },
		]);
	});

	it('strips only the single space after the colon', () => {
		expect(new SseDecoder().push('event: change\ndata:  x\n\n')).toEqual([{ event: 'change', data: ' x' }]);
	});

	it('defaults the event name to message', () => {
		expect(new SseDecoder().push('data: hello\n\n')).toEqual([{ event: 'message', data: 'hello' }]);
	});

	it('captures the id field', () => {
		expect(new SseDecoder().push('id: 42\nevent: change\ndata: x\n\n')).toEqual([
			{ event: 'change', data: 'x', id: '42' },
		]);
	});

	it('flushes a trailing frame that was never terminated', () => {
		const decoder = new SseDecoder();
		expect(decoder.push('event: change\ndata: last')).toEqual([]);
		expect(decoder.flush()).toEqual([{ event: 'change', data: 'last' }]);
	});

	it('flushes nothing when the buffer is empty', () => {
		const decoder = new SseDecoder();
		decoder.push('event: change\ndata: x\n\n');
		expect(decoder.flush()).toEqual([]);
	});
});

describe('toRealtimeChange', () => {
	const frame = (data: string) => ({ event: 'change', data });

	it('narrows a change frame', () => {
		const change = toRealtimeChange(
			frame(
				JSON.stringify({
					topic: 'playlist',
					entityId: 'p1',
					operation: 'track.moved',
					actorId: 'u1',
					version: 7,
					at: '2026-01-01T00:00:00.000Z',
				})
			)
		);
		expect(change).toEqual({
			topic: 'playlist',
			entityId: 'p1',
			operation: 'track.moved',
			actorId: 'u1',
			version: 7,
			at: '2026-01-01T00:00:00.000Z',
		});
	});

	it('ignores the ready frame', () => {
		expect(toRealtimeChange({ event: 'ready', data: '{}' })).toBeNull();
	});

	it('returns null on malformed JSON instead of throwing', () => {
		expect(toRealtimeChange(frame('{"topic":'))).toBeNull();
	});

	it('returns null when the required fields are missing', () => {
		expect(toRealtimeChange(frame('{"topic":"playlist"}'))).toBeNull();
	});
});
