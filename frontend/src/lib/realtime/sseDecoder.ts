

export interface SseFrame {
	event: string;
	data: string;
	id?: string;
}


export class SseDecoder {
	private buffer = '';

	push(chunk: string): SseFrame[] {
		this.buffer += chunk;
		const frames: SseFrame[] = [];

		this.buffer = this.buffer.replace(/\r\n/g, '\n');

		let separator = this.buffer.indexOf('\n\n');
		while (separator !== -1) {
			const raw = this.buffer.slice(0, separator);
			this.buffer = this.buffer.slice(separator + 2);
			const frame = parseFrame(raw);
			if (frame) frames.push(frame);
			separator = this.buffer.indexOf('\n\n');
		}

		return frames;
	}

	flush(): SseFrame[] {
		const raw = this.buffer;
		this.buffer = '';
		const frame = raw.trim() ? parseFrame(raw) : null;
		return frame ? [frame] : [];
	}
}

const parseFrame = (raw: string): SseFrame | null => {
	const dataLines: string[] = [];
	let event: string | undefined;
	let id: string | undefined;

	for (const line of raw.split('\n')) {
		if (line.startsWith(':')) continue;
		if (line.length === 0) continue;

		const colon = line.indexOf(':');
		const field = colon === -1 ? line : line.slice(0, colon);
		const value = colon === -1 ? '' : line.slice(colon + 1).replace(/^ /, '');

		if (field === 'data') dataLines.push(value);
		else if (field === 'event') event = value;
		else if (field === 'id') id = value;
	}

	if (dataLines.length === 0 && event === undefined) return null;

	return { event: event ?? 'message', data: dataLines.join('\n'), ...(id ? { id } : {}) };
};

export interface RealtimeChange {
	topic: string;
	entityId: string;
	operation: string;
	actorId?: string;
	version?: number;
	at: string;
}

export const toRealtimeChange = (frame: SseFrame): RealtimeChange | null => {
	if (frame.event !== 'change') return null;
	try {
		const parsed = JSON.parse(frame.data) as Partial<RealtimeChange>;
		if (typeof parsed.topic !== 'string' || typeof parsed.entityId !== 'string') return null;
		return {
			topic: parsed.topic,
			entityId: parsed.entityId,
			operation: typeof parsed.operation === 'string' ? parsed.operation : 'unknown',
			actorId: parsed.actorId,
			version: parsed.version,
			at: typeof parsed.at === 'string' ? parsed.at : new Date().toISOString(),
		};
	} catch {
		return null;
	}
};
