import type { RequestHandler } from 'express';

export type RealtimeTopic = 'playlist' | 'event' | 'device';

export interface RealtimeEvent {
	topic: RealtimeTopic;
	entityId: string;
	version?: number;
	actorId?: string;
	operation: string;
	payload?: unknown;
}

interface Subscriber {
	id: number;
	userId: string;
	res: import('express').Response;
	keys: Set<string>;
}

const keyOf = (topic: RealtimeTopic, entityId: string): string => `${topic}:${entityId}`;

let nextSubscriberId = 1;
const subscribers = new Map<number, Subscriber>();

const HEARTBEAT_MS = 25_000;

export const subscriberCount = (): number => subscribers.size;

const write = (res: import('express').Response, event: string, data: unknown): void => {
	res.write(`event: ${event}\n`);
	res.write(`data: ${JSON.stringify(data)}\n\n`);
};

export const publish = (event: RealtimeEvent): void => {
	const key = keyOf(event.topic, event.entityId);

	for (const subscriber of subscribers.values()) {
		if (!subscriber.keys.has(key)) continue;

		write(subscriber.res, 'change', {
			topic: event.topic,
			entityId: event.entityId,
			version: event.version,
			actorId: event.actorId,
			operation: event.operation,
			payload: event.payload ?? null,
			at: new Date().toISOString(),
		});
	}
};

export const replaceSubscription = (subscriberId: number, keys: string[]): void => {
	const subscriber = subscribers.get(subscriberId);
	if (subscriber) subscriber.keys = new Set(keys);
};

export const sseHandler: RequestHandler = (req, res) => {
	const resolved = req.userId ?? (res.locals?.userId as string | undefined);
	const userId = typeof resolved === 'string' ? resolved : null;

	if (!userId) {
		res.status(401).json({ success: false, message: 'No token provided' });
		return;
	}

	const topic = (req.query.topic as RealtimeTopic | undefined) ?? 'playlist';
	const entityId = typeof req.query.entity_id === 'string' ? req.query.entity_id : null;

	if (!['playlist', 'event', 'device'].includes(topic)) {
		res.status(400).json({ success: false, message: 'Unsupported topic' });
		return;
	}

	if (!entityId) {
		res.status(400).json({ success: false, message: 'entity_id is required' });
		return;
	}

	const isAllowed = res.locals?.canSubscribe as
		((topic: RealtimeTopic, entityId: string) => Promise<boolean>) | undefined;

	if (!isAllowed) {
		res.status(500).json({ success: false, message: 'Realtime is not configured' });
		return;
	}

	isAllowed(topic, entityId)
		.then((allowed) => {
			if (!allowed) {
				res.status(403).json({ success: false, message: 'Not allowed to watch this resource' });
				return;
			}

			res.status(200);
			res.setHeader('Content-Type', 'text/event-stream');
			res.setHeader('Cache-Control', 'no-cache, no-transform');
			res.setHeader('Connection', 'keep-alive');
			res.setHeader('X-Accel-Buffering', 'no');
			res.flushHeaders?.();

			const id = nextSubscriberId++;
			subscribers.set(id, { id, userId, res, keys: new Set([keyOf(topic, entityId)]) });

			write(res, 'ready', { topic, entityId, at: new Date().toISOString() });

			const heartbeat = setInterval(() => {
				res.write(': ping\n\n');
			}, HEARTBEAT_MS);

			req.on('close', () => {
				clearInterval(heartbeat);
				subscribers.delete(id);
				res.end();
			});
		})
		.catch(() => {
			res.status(500).json({ success: false, message: 'Internal server error' });
		});
};

export const resetRealtimeForTests = (): void => {
	subscribers.clear();
	nextSubscriberId = 1;
};
