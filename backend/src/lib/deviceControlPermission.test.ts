import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { decideControlPermission } from './deviceControlPermission';

const OWNER = 'user-owner';
const DELEGATE = 'user-delegate';
const STRANGER = 'user-stranger';

const device = (over: Record<string, unknown> = {}) => ({
	ownerId: OWNER,
	revokedAt: null,
	permissions: [] as unknown[],
	...over,
});

describe('decideControlPermission', () => {
	it('returns NOT_FOUND for a missing device so the route can answer 404', () => {
		const result = decideControlPermission(null, OWNER);
		assert.deepEqual(result, { ok: false, reason: 'NOT_FOUND' });
	});

	it('lets the owner drive their device', () => {
		assert.deepEqual(decideControlPermission(device(), OWNER), { ok: true, level: 'OWNER' });
	});

	it('lets a CONTROL delegate drive it', () => {
		assert.deepEqual(decideControlPermission(device({ permissions: [{ id: 'p1' }] }), DELEGATE), {
			ok: true,
			level: 'DELEGATE_CONTROL',
		});
	});

	it('denies a stranger', () => {
		assert.deepEqual(decideControlPermission(device(), STRANGER), { ok: false, reason: 'FORBIDDEN' });
	});

	it('denies even the owner once the device is revoked', () => {
		const result = decideControlPermission(device({ revokedAt: new Date() }), OWNER);
		assert.deepEqual(result, { ok: false, reason: 'REVOKED' });
	});

	it('denies a delegate on a revoked device', () => {
		const result = decideControlPermission(
			device({ revokedAt: new Date(), permissions: [{ id: 'p1' }] }),
			DELEGATE
		);
		assert.deepEqual(result, { ok: false, reason: 'REVOKED' });
	});

	it('never distinguishes REVOKED from FORBIDDEN in a way the route could leak', () => {
		const revoked = decideControlPermission(device({ revokedAt: new Date() }), STRANGER);
		const forbidden = decideControlPermission(device(), STRANGER);
		assert.equal(revoked.ok, false);
		assert.equal(forbidden.ok, false);
	});
});
