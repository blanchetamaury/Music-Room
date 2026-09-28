import assert from 'node:assert/strict';
import type { Request } from 'express';
import { describe, it } from 'node:test';
import { createCsrfCookie, generateCsrfToken, getCsrfTokenFromRequest, hasBearerToken, verifyCsrf } from './csrf';

const asRequest = (headers: Record<string, string>): Request => ({ headers }) as unknown as Request;

const asWebRequest = (headers: Record<string, string>): globalThis.Request =>
	new Request('http://localhost/api/test', { method: 'POST', headers });

describe('generateCsrfToken', () => {
	it('produces 32 random bytes as hex', () => {
		const token = generateCsrfToken();
		assert.match(token, /^[0-9a-f]{64}$/);
	});

	it('does not repeat itself', () => {
		const tokens = new Set(Array.from({ length: 50 }, () => generateCsrfToken()));
		assert.equal(tokens.size, 50);
	});
});

describe('createCsrfCookie', () => {
	it('returns a cookie that is readable but not HttpOnly', () => {
		const { token, cookie } = createCsrfCookie();
		assert.match(cookie, new RegExp(`^csrf_token=${token};`));
		assert.ok(!cookie.includes('HttpOnly'), 'the client must read the CSRF cookie');
		assert.ok(cookie.includes('SameSite=Strict'));
	});
});

describe('getCsrfTokenFromRequest', () => {
	it('reads the token from the cookie header', () => {
		assert.equal(getCsrfTokenFromRequest(asRequest({ cookie: 'other=1; csrf_token=abc; more=2' })), 'abc');
	});

	it('returns null when absent', () => {
		assert.equal(getCsrfTokenFromRequest(asRequest({ cookie: 'other=1' })), null);
		assert.equal(getCsrfTokenFromRequest(asRequest({})), null);
	});
});

describe('hasBearerToken', () => {
	it('detects the Bearer scheme', () => {
		assert.equal(hasBearerToken(asRequest({ authorization: 'Bearer abc' })), true);
	});

	it('rejects other schemes and casing variants', () => {
		assert.equal(hasBearerToken(asRequest({ authorization: 'bearer abc' })), false);
		assert.equal(hasBearerToken(asRequest({ authorization: 'Basic abc' })), false);
		assert.equal(hasBearerToken(asRequest({ authorization: 'Bearer' })), false);
		assert.equal(hasBearerToken(asRequest({})), false);
	});
});

describe('verifyCsrf', () => {
	it('accepts a matching cookie/header pair', () => {
		const req = asRequest({ cookie: 'csrf_token=secret', 'x-csrf-token': 'secret' });
		assert.equal(verifyCsrf(req), true);
	});

	it('rejects a mismatching token', () => {
		const req = asRequest({ cookie: 'csrf_token=secret', 'x-csrf-token': 'other' });
		assert.equal(verifyCsrf(req), false);
	});

	it('rejects a missing cookie or header', () => {
		assert.equal(verifyCsrf(asRequest({ 'x-csrf-token': 'secret' })), false);
		assert.equal(verifyCsrf(asRequest({ cookie: 'csrf_token=secret' })), false);
		assert.equal(verifyCsrf(asRequest({})), false);
	});

	it('accepts Bearer-authenticated requests without a CSRF token', () => {
		assert.equal(verifyCsrf(asRequest({ authorization: 'Bearer abc' })), true);
	});

	it('still rejects a Bearer request carrying a bad CSRF pair', () => {
		const req = asRequest({
			authorization: 'Bearer abc',
			cookie: 'csrf_token=secret',
			'x-csrf-token': 'wrong',
		});
		assert.equal(verifyCsrf(req), true, 'Bearer auth short-circuits the CSRF check');
	});

	describe('across both request shapes', () => {
		it('accepts a valid double-submit pair on a Web Request', () => {
			const req = asWebRequest({ cookie: 'csrf_token=secret', 'x-csrf-token': 'secret' });
			assert.equal(getCsrfTokenFromRequest(req), 'secret');
			assert.equal(verifyCsrf(req), true);
		});

		it('accepts a Bearer request on a Web Request', () => {
			assert.equal(hasBearerToken(asWebRequest({ authorization: 'Bearer abc' })), true);
			assert.equal(verifyCsrf(asWebRequest({ authorization: 'Bearer abc' })), true);
		});

		it('rejects a mismatching pair on a Web Request', () => {
			assert.equal(verifyCsrf(asWebRequest({ cookie: 'csrf_token=secret', 'x-csrf-token': 'nope' })), false);
		});

		it('agrees on the verdict whatever the shape', () => {
			const cases: Array<Record<string, string>> = [
				{ cookie: 'csrf_token=secret', 'x-csrf-token': 'secret' },
				{ cookie: 'csrf_token=secret', 'x-csrf-token': 'other' },
				{ 'x-csrf-token': 'secret' },
				{ cookie: 'csrf_token=secret' },
				{ authorization: 'Bearer abc' },
				{},
			];
			for (const headers of cases) {
				assert.equal(
					verifyCsrf(asWebRequest(headers)),
					verifyCsrf(asRequest(headers)),
					`disagreement for ${JSON.stringify(headers)}`
				);
			}
		});
	});
});
