import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { RATE_LIMITS, consume, resetRateLimits, type RateLimitRule } from './rate-limit';

const rule: RateLimitRule = { name: 'test', limit: 3, windowMs: 1000 };

describe('consume', () => {
	beforeEach(() => resetRateLimits());

	it('allows requests up to the limit', () => {
		const t0 = 1_000_000;
		assert.equal(consume(rule, 'a', t0).allowed, true);
		assert.equal(consume(rule, 'a', t0).allowed, true);
		assert.equal(consume(rule, 'a', t0).allowed, true);
	});

	it('rejects the request that exceeds the limit', () => {
		const t0 = 1_000_000;
		for (let i = 0; i < 3; i++) consume(rule, 'a', t0);
		const fourth = consume(rule, 'a', t0);
		assert.equal(fourth.allowed, false);
		assert.equal(fourth.remaining, 0);
	});

	it('reports Retry-After from the window, not from zero', () => {
		const t0 = 1_000_000;
		for (let i = 0; i < 3; i++) consume(rule, 'a', t0);
		const denied = consume(rule, 'a', t0 + 250);
		assert.equal(denied.retryAfterSeconds, 1);
	});

	it('keeps separate budgets per identity', () => {
		const t0 = 1_000_000;
		for (let i = 0; i < 3; i++) consume(rule, 'a', t0);
		assert.equal(consume(rule, 'a', t0).allowed, false);
		assert.equal(consume(rule, 'b', t0).allowed, true);
	});

	it('resets once the window has elapsed', () => {
		const t0 = 1_000_000;
		for (let i = 0; i < 3; i++) consume(rule, 'a', t0);
		assert.equal(consume(rule, 'a', t0).allowed, false);
		assert.equal(consume(rule, 'a', t0 + rule.windowMs).allowed, true);
	});

	it('never reports a negative remaining count', () => {
		const t0 = 1_000_000;
		let remaining = 3;
		for (let i = 0; i < 10; i++) remaining = consume(rule, 'a', t0).remaining;
		assert.equal(remaining, 0);
	});

	it('expires the bucket rather than resetting it silently mid-window', () => {
		const t0 = 1_000_000;
		consume(rule, 'a', t0);
		const before = consume(rule, 'a', t0 + 999);
		assert.equal(before.allowed, true);
		assert.equal(before.resetAt, t0 + rule.windowMs);
	});
});

describe('RATE_LIMITS', () => {
	it('namespaces every bucket so endpoints do not share a budget', () => {
		const names = Object.values(RATE_LIMITS).map((r) => r.name);
		assert.equal(new Set(names).size, names.length);
	});

	it('covers every endpoint family the audit names', () => {
		for (const key of [
			'passwordResetRequest',
			'emailVerification',
			'oauthStart',
			'deezerSearch',
			'eventVote',
			'playlistMutation',
		] as const) {
			assert.ok(RATE_LIMITS[key], `missing rule ${key}`);
		}
	});

	it('is far stricter on credential endpoints than on data endpoints', () => {
		assert.ok(RATE_LIMITS.passwordResetRequest.limit < RATE_LIMITS.deezerLookup.limit);
		assert.ok(RATE_LIMITS.emailResend.limit < RATE_LIMITS.deezerLookup.limit);
		assert.ok(RATE_LIMITS.oauthStart.limit < RATE_LIMITS.deezerSearch.limit);
	});

	it('uses a positive limit and window everywhere', () => {
		for (const r of Object.values(RATE_LIMITS)) {
			assert.ok(r.limit > 0, r.name);
			assert.ok(r.windowMs > 0, r.name);
		}
	});
});
