import { SseDecoder, type RealtimeChange, type SseFrame, toRealtimeChange } from './sseDecoder';

export type SseStatus = 'idle' | 'connecting' | 'open' | 'reconnecting' | 'closed';

export interface SseConnectionOptions {
	url: string;
	token: string;
	onChange: (change: RealtimeChange) => void;
	onStatus?: (status: SseStatus) => void;
	onOpen?: () => void;
	onResync?: () => void;
}

const HEARTBEAT_TIMEOUT_MS = 40_000;
const BASE_RETRY_MS = 1_000;
const MAX_RETRY_MS = 30_000;

export class SseConnection {
	private xhr: XMLHttpRequest | null = null;
	private decoder = new SseDecoder();
	private retryAttempt = 0;
	private retryTimer: ReturnType<typeof setTimeout> | null = null;
	private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
	private stopped = false;
	private everOpened = false;

	constructor(private readonly options: SseConnectionOptions) {}

	start(): void {
		this.stopped = false;
		this.open();
	}

	stop(): void {
		this.stopped = true;
		this.clearTimers();
		if (this.xhr) {
			this.xhr.onreadystatechange = null;
			this.xhr.onerror = null;
			this.xhr.abort();
			this.xhr = null;
		}
		this.decoder = new SseDecoder();
		this.options.onStatus?.('closed');
	}

	private open(): void {
		if (this.stopped) return;

		this.options.onStatus?.(this.everOpened ? 'reconnecting' : 'connecting');
		this.decoder = new SseDecoder();

		const xhr = new XMLHttpRequest();
		this.xhr = xhr;
		xhr.open('GET', this.options.url, true);
		xhr.setRequestHeader('Authorization', `Bearer ${this.options.token}`);
		xhr.setRequestHeader('Accept', 'text/event-stream');
		xhr.setRequestHeader('Cache-Control', 'no-cache');

		let opened = false;

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 3) {
				if (!opened) {
					opened = true;
					this.retryAttempt = 0;
					this.options.onStatus?.('open');
					this.options.onOpen?.();
					if (this.everOpened) this.options.onResync?.();
					this.everOpened = true;
				}
				this.armHeartbeat();
				this.drain(xhr.responseText);
			}
		};

		xhr.onerror = () => {
			if (this.stopped) return;
			this.scheduleRetry();
		};

		xhr.onloadend = () => {
			if (this.stopped) return;
			this.emit(this.decoder.flush());
			this.scheduleRetry();
		};

		xhr.send();
	}

	private consumed = 0;
	private drain(responseText: string): void {
		if (!responseText || responseText.length <= this.consumed) {
			if (responseText.length < this.consumed) this.consumed = 0;
			return;
		}
		const chunk = responseText.slice(this.consumed);
		this.consumed = responseText.length;
		this.emit(this.decoder.push(chunk));
	}

	private emit(frames: SseFrame[]): void {
		for (const frame of frames) {
			const change = toRealtimeChange(frame);
			if (change) this.options.onChange(change);
		}
	}

	private armHeartbeat(): void {
		if (this.heartbeatTimer) clearTimeout(this.heartbeatTimer);
		this.heartbeatTimer = setTimeout(() => {
			if (this.stopped) return;
			if (this.xhr) {
				this.xhr.onreadystatechange = null;
				this.xhr.onerror = null;
				this.xhr.abort();
				this.xhr = null;
			}
			this.scheduleRetry();
		}, HEARTBEAT_TIMEOUT_MS) as unknown as ReturnType<typeof setInterval>;
	}

	private scheduleRetry(): void {
		if (this.stopped || this.retryTimer) return;
		this.consumed = 0;
		this.clearTimers();

		const ceiling = Math.min(MAX_RETRY_MS, BASE_RETRY_MS * 2 ** this.retryAttempt);
		const delay = Math.round(ceiling * (0.7 + Math.random() * 0.6));
		this.retryAttempt += 1;

		this.options.onStatus?.('reconnecting');
		this.retryTimer = setTimeout(() => {
			this.retryTimer = null;
			this.open();
		}, delay);
	}

	private clearTimers(): void {
		if (this.retryTimer) {
			clearTimeout(this.retryTimer);
			this.retryTimer = null;
		}
		if (this.heartbeatTimer) {
			clearTimeout(this.heartbeatTimer);
			this.heartbeatTimer = null;
		}
	}
}
