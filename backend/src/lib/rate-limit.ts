export interface RateLimitRule {
	name: string;
	limit: number;
	windowMs: number;
}

interface Bucket {
	count: number;
	resetAt: number;
}

const buckets = new Map<string, Bucket>();

const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanupAt = 0;

const sweep = (now: number): void => {
	if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) return;
	lastCleanupAt = now;
	for (const [key, bucket] of buckets) {
		if (bucket.resetAt <= now) buckets.delete(key);
	}
};

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	limit: number;
	resetAt: number;
	retryAfterSeconds: number;
}

export const consume = (rule: RateLimitRule, identity: string, now = Date.now()): RateLimitResult => {
	sweep(now);

	const key = `${rule.name}:${identity}`;
	const bucket = buckets.get(key);

	if (!bucket || bucket.resetAt <= now) {
		buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
		return {
			allowed: true,
			remaining: rule.limit - 1,
			limit: rule.limit,
			resetAt: now + rule.windowMs,
			retryAfterSeconds: Math.ceil(rule.windowMs / 1000),
		};
	}

	bucket.count += 1;
	const allowed = bucket.count <= rule.limit;

	return {
		allowed,
		remaining: Math.max(0, rule.limit - bucket.count),
		limit: rule.limit,
		resetAt: bucket.resetAt,
		retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
	};
};

export const resetRateLimits = (): void => {
	buckets.clear();
	lastCleanupAt = 0;
};

export const RATE_LIMITS = {
	passwordResetRequest: { name: 'auth:reset-request', limit: 3, windowMs: 15 * 60_000 },
	passwordResetVerify: { name: 'auth:reset-verify', limit: 10, windowMs: 15 * 60_000 },
	emailVerification: { name: 'auth:email-verification', limit: 5, windowMs: 15 * 60_000 },
	emailResend: { name: 'auth:email-resend', limit: 3, windowMs: 15 * 60_000 },
	oauthStart: { name: 'auth:oauth-start', limit: 10, windowMs: 15 * 60_000 },
	deezerSearch: { name: 'deezer:search', limit: 60, windowMs: 60_000 },
	deezerLookup: { name: 'deezer:lookup', limit: 120, windowMs: 60_000 },
	eventVote: { name: 'event:vote', limit: 30, windowMs: 60_000 },
	playlistMutation: { name: 'playlist:mutation', limit: 60, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitRule>;

export type RateLimitName = keyof typeof RATE_LIMITS;
