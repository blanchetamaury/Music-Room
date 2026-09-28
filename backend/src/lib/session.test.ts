import assert from 'node:assert/strict';
import type { Request } from 'express';
import { SignJWT } from 'jose';
import { before, describe, it } from 'node:test';
import { getSessionSecret } from './session-secret';
import { SESSION_MAX_AGE_SECONDS, decrypt, encrypt, getSession, parseUserId } from './session';

const SECRET = 'unit-test-secret-that-is-definitely-long-enough';
process.env.SESSION_SECRET = SECRET;

const asRequest = (headers: Record<string, string>): Request => ({ headers }) as unknown as Request;

const USER = 'user-1';

describe('getSessionSecret', () => {
	it('rejects a missing secret', () => {
		const previous = process.env.SESSION_SECRET;
		delete process.env.SESSION_SECRET;
		assert.throws(() => getSessionSecret(), /SESSION_SECRET/);
		process.env.SESSION_SECRET = previous;
	});

	it('rejects a secret shorter than 32 characters', () => {
		const previous = process.env.SESSION_SECRET;
		process.env.SESSION_SECRET = 'too-short';
		assert.throws(() => getSessionSecret(), /at least 32/);
		process.env.SESSION_SECRET = previous;
	});
});

describe('encrypt / decrypt', () => {
	before(() => {
		process.env.SESSION_SECRET = SECRET;
	});

	it('round-trips a payload', async () => {
		const exp = Math.floor(Date.now() / 1000) + 60;
		const token = await encrypt({ user_id: USER, iat: 0, iss: 'music room', exp });
		const payload = await decrypt(token);
		assert.equal(payload.user_id, USER);
	});

	it('rejects a token signed with another secret', async () => {
		const exp = Math.floor(Date.now() / 1000) + 60;
		const foreign = await new SignJWT({ user_id: USER, iss: 'music room', exp })
			.setProtectedHeader({ alg: 'HS256' })
			.setExpirationTime(exp)
			.sign(new TextEncoder().encode('another-secret-that-is-long-enough-xx'));
		await assert.rejects(() => decrypt(foreign));
	});

	it('rejects an expired token', async () => {
		const token = await new SignJWT({ user_id: USER, iss: 'music room', exp: Math.floor(Date.now() / 1000) - 10 })
			.setProtectedHeader({ alg: 'HS256' })
			.sign(getSessionSecret());
		await assert.rejects(() => decrypt(token));
	});

	it('rejects a token issued by someone else', async () => {
		const exp = Math.floor(Date.now() / 1000) + 60;
		const token = await new SignJWT({ user_id: USER, iss: 'someone else', exp })
			.setProtectedHeader({ alg: 'HS256' })
			.setExpirationTime(exp)
			.sign(getSessionSecret());
		await assert.rejects(() => decrypt(token));
	});

	it('rejects an empty token', async () => {
		await assert.rejects(() => decrypt(''));
	});
});

describe('getSession', () => {
	before(() => {
		process.env.SESSION_SECRET = SECRET;
	});

	const liveToken = async (userId = USER) => {
		const exp = Math.floor(Date.now() / 1000) + 60;
		return encrypt({ user_id: userId, iat: 0, iss: 'music room', exp });
	};

	it('reads the token from the Authorization header', async () => {
		const session = await getSession(asRequest({ authorization: `Bearer ${await liveToken()}` }));
		assert.equal(session?.user_id, USER);
	});

	it('reads the token from the cookie', async () => {
		const session = await getSession(asRequest({ cookie: `a=1; token=${await liveToken()}; b=2` }));
		assert.equal(session?.user_id, USER);
	});

	it('returns null without any token', async () => {
		assert.equal(await getSession(asRequest({})), null);
	});

	it('returns null for a malformed token', async () => {
		assert.equal(await getSession(asRequest({ authorization: 'Bearer not-a-jwt' })), null);
	});

	it('returns null for an expired token', async () => {
		const exp = Math.floor(Date.now() / 1000) - 5;
		const token = await new SignJWT({ user_id: USER, iss: 'music room', exp })
			.setProtectedHeader({ alg: 'HS256' })
			.setExpirationTime(exp)
			.sign(getSessionSecret());
		assert.equal(await getSession(asRequest({ authorization: `Bearer ${token}` })), null);
	});
});

describe('parseUserId', () => {
	it('resolves the "me" alias to the session user', () => {
		assert.deepEqual(parseUserId('me', { user_id: USER } as never), { id: USER, is_me: true });
	});

	it('flags the session user when addressed directly', () => {
		assert.deepEqual(parseUserId(USER, { user_id: USER } as never), { id: USER, is_me: true });
	});

	it('flags another user as not me', () => {
		assert.deepEqual(parseUserId('other', { user_id: USER } as never), { id: 'other', is_me: false });
	});
});

describe('session lifetime', () => {
	it('is two hours', () => {
		assert.equal(SESSION_MAX_AGE_SECONDS, 2 * 60 * 60);
	});
});
