import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CreateEventSchema, EventTrackSchema } from './MusicEventSchema';
import { EventMemberInviteSchema } from './EventMemberSchema';

const ok = (schema: { safeParse: (v: unknown) => { success: boolean } }, value: unknown) =>
	schema.safeParse(value).success;

describe('CreateEventSchema', () => {
	it('defaults visibility and voting policy', () => {
		const result = CreateEventSchema.parse({ name: 'soiree' });
		assert.equal(result.visibility, 'PUBLIC');
		assert.equal(result.votingPolicy, 'EVERYONE');
	});

	it('requires a non-empty name', () => {
		assert.equal(ok(CreateEventSchema, { name: '' }), false);
		assert.equal(ok(CreateEventSchema, { name: '   x'.slice(1) }), true);
		assert.equal(ok(CreateEventSchema, { name: 'a'.repeat(101) }), false);
		assert.equal(ok(CreateEventSchema, {}), false);
	});

	it('caps the description length', () => {
		assert.equal(ok(CreateEventSchema, { name: 'a', description: 'x'.repeat(500) }), true);
		assert.equal(ok(CreateEventSchema, { name: 'a', description: 'x'.repeat(501) }), false);
	});

	it('bounds the coordinates', () => {
		assert.equal(ok(CreateEventSchema, { name: 'a', latitude: 90, longitude: 180 }), true);
		assert.equal(ok(CreateEventSchema, { name: 'a', latitude: 90.1, longitude: 0 }), false);
		assert.equal(ok(CreateEventSchema, { name: 'a', latitude: 0, longitude: -180.1 }), false);
		assert.equal(ok(CreateEventSchema, { name: 'a', latitude: '48', longitude: 2 }), false);
	});

	it('bounds the radius to a positive integer of at most 100 km', () => {
		assert.equal(ok(CreateEventSchema, { name: 'a', radius: 1 }), true);
		assert.equal(ok(CreateEventSchema, { name: 'a', radius: 100_000 }), true);
		assert.equal(ok(CreateEventSchema, { name: 'a', radius: 0 }), false);
		assert.equal(ok(CreateEventSchema, { name: 'a', radius: -5 }), false);
		assert.equal(ok(CreateEventSchema, { name: 'a', radius: 100_001 }), false);
		assert.equal(ok(CreateEventSchema, { name: 'a', radius: 1.5 }), false);
	});

	it('coerces the date window', () => {
		const result = CreateEventSchema.parse({
			name: 'a',
			startAt: '2026-01-15T12:00:00.000Z',
			endAt: '2026-01-15T14:00:00.000Z',
		});
		assert.ok(result.startAt instanceof Date);
		assert.ok(result.endAt instanceof Date);
	});

	it('rejects unknown enum values', () => {
		assert.equal(ok(CreateEventSchema, { name: 'a', visibility: 'SECRET' }), false);
		assert.equal(ok(CreateEventSchema, { name: 'a', votingPolicy: 'ANYONE' }), false);
	});
});

describe('EventTrackSchema', () => {
	it('requires an event and a track id', () => {
		assert.equal(ok(EventTrackSchema, { eventId: 'e', trackId: 't' }), true);
		assert.equal(ok(EventTrackSchema, { eventId: 'e' }), false);
		assert.equal(ok(EventTrackSchema, { trackId: 't' }), false);
		assert.equal(ok(EventTrackSchema, { eventId: '', trackId: 't' }), false);
	});

	it('treats the position as optional but validated', () => {
		assert.equal(ok(EventTrackSchema, { eventId: 'e', trackId: 't', latitude: 48.8, longitude: 2.3 }), true);
		assert.equal(ok(EventTrackSchema, { eventId: 'e', trackId: 't', latitude: 91, longitude: 2.3 }), false);
		assert.equal(ok(EventTrackSchema, { eventId: 'e', trackId: 't', latitude: 48.8 }), false);
	});
});

describe('EventMemberInviteSchema', () => {
	it('accepts an invitation by username or by user id', () => {
		assert.equal(ok(EventMemberInviteSchema, { eventId: 'e', username: 'someone' }), true);
		assert.equal(ok(EventMemberInviteSchema, { eventId: 'e', userId: 'u-1' }), true);
	});

	it('defaults the role to MEMBER', () => {
		assert.equal(EventMemberInviteSchema.parse({ eventId: 'e', username: 'someone' }).role, 'MEMBER');
	});

	it('rejects a missing event and a bad role', () => {
		assert.equal(ok(EventMemberInviteSchema, { username: 'someone' }), false);
		assert.equal(ok(EventMemberInviteSchema, { eventId: 'e', username: 'x', role: 'OWNER' }), false);
	});

	it('requires the username to be 3 to 30 characters', () => {
		assert.equal(ok(EventMemberInviteSchema, { eventId: 'e', username: 'ab' }), false);
		assert.equal(ok(EventMemberInviteSchema, { eventId: 'e', username: 'a'.repeat(31) }), false);
	});
});
