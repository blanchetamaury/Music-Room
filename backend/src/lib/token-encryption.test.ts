import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { decryptToken, encryptToken, isEncryptedToken, secretsMatch } from './token-encryption';

const SECRET = 'unit-test-secret-that-is-definitely-long-enough';
process.env.SESSION_SECRET = SECRET;
delete process.env.TOKEN_ENCRYPTION_KEY;

describe('token encryption at rest', () => {
	it('never stores the plaintext', () => {
		const sealed = encryptToken('ya29.a0AfB_secret-access-token');
		assert.notEqual(sealed, 'ya29.a0AfB_secret-access-token');
		assert.ok(!sealed.includes('ya29.a0AfB'));
		assert.ok(isEncryptedToken(sealed));
	});

	it('round-trips the token', () => {
		assert.equal(decryptToken(encryptToken('ya29.a0AfB_secret')), 'ya29.a0AfB_secret');
	});

	it('produces a different ciphertext each time (random IV)', () => {
		const a = encryptToken('same-token');
		const b = encryptToken('same-token');
		assert.notEqual(a, b);
		assert.equal(decryptToken(a), decryptToken(b));
	});

	it('keeps working when a dedicated key is configured', () => {
		process.env.TOKEN_ENCRYPTION_KEY = 'a-different-secret-of-at-least-32-chars';
		try {
			const sealed = encryptToken('refresh-token-value');
			assert.equal(decryptToken(sealed), 'refresh-token-value');
		} finally {
			delete process.env.TOKEN_ENCRYPTION_KEY;
		}
	});

	it('produces ciphertext that another key cannot read', () => {
		const sealed = encryptToken('access-token-value');
		process.env.TOKEN_ENCRYPTION_KEY = 'a-different-secret-of-at-least-32-chars';
		try {
			assert.throws(() => decryptToken(sealed));
		} finally {
			delete process.env.TOKEN_ENCRYPTION_KEY;
		}
	});

	it('detects a tampered ciphertext via the GCM auth tag', () => {
		const sealed = encryptToken('access-token-value');
		const parts = sealed.split('.');
		const body = Buffer.from(parts[3], 'base64url');
		body[0] ^= 0xff;
		parts[3] = body.toString('base64url');
		assert.throws(() => decryptToken(parts.join('.')));
	});

	it('rejects a malformed envelope', () => {
		assert.throws(() => decryptToken('encv1.only.two.parts'), /Malformed/);
		assert.throws(() => decryptToken('encv1.a.b'), /Malformed/);
	});

	it('reads rows written before encryption existed', () => {
		assert.equal(isEncryptedToken('plain-old-access-token'), false);
		assert.equal(decryptToken('plain-old-access-token'), 'plain-old-access-token');
	});

	it('rejects a missing or short key material', () => {
		const previous = process.env.SESSION_SECRET;
		delete process.env.SESSION_SECRET;
		try {
			assert.throws(() => encryptToken('x'), /TOKEN_ENCRYPTION_KEY/);
		} finally {
			process.env.SESSION_SECRET = previous;
		}
	});
});

describe('secretsMatch', () => {
	it('accepts identical secrets', () => {
		assert.equal(secretsMatch('abc123', 'abc123'), true);
	});

	it('rejects different secrets', () => {
		assert.equal(secretsMatch('abc123', 'abc124'), false);
	});

	it('rejects a length mismatch without throwing', () => {
		assert.equal(secretsMatch('abc', 'abcdef'), false);
	});
});
