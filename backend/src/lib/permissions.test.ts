import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	decideDeviceControl,
	decideDeviceManage,
	decideEventEdit,
	decideEventRead,
	decideEventVotingAccess,
	decidePlaylistEdit,
	decidePlaylistRead,
	type EventVotingAuthRow,
	type PlaylistAuthRow,
} from './permissions';

const OWNER = 'owner-1';
const MEMBER = 'member-1';
const STRANGER = 'stranger-1';

const VENUE = { latitude: 48.8566, longitude: 2.3522 };

const playlist = (overrides: Partial<PlaylistAuthRow> = {}): PlaylistAuthRow => ({
	visibility: 'PRIVATE',
	ownerId: OWNER,
	editPolicy: 'EVERYONE',
	members: [],
	...overrides,
});

describe('decidePlaylistRead', () => {
	it('lets the owner read their playlist', () => {
		assert.equal(decidePlaylistRead(playlist(), OWNER), true);
	});

	it('lets anyone read a public playlist', () => {
		assert.equal(decidePlaylistRead(playlist({ visibility: 'PUBLIC' }), STRANGER), true);
	});

	it('denies a stranger on a private playlist', () => {
		assert.equal(decidePlaylistRead(playlist(), STRANGER), false);
	});

	it('lets an accepted member read a private playlist', () => {
		assert.equal(decidePlaylistRead(playlist({ members: [{ role: 'VIEWER' }] }), MEMBER), true);
	});
});

describe('decidePlaylistEdit', () => {
	it('lets the owner edit', () => {
		assert.equal(decidePlaylistEdit(playlist(), OWNER), true);
	});

	it('lets an EDITOR edit even when the policy is INVITED_ONLY', () => {
		assert.equal(
			decidePlaylistEdit(playlist({ editPolicy: 'INVITED_ONLY', members: [{ role: 'EDITOR' }] }), MEMBER),
			true
		);
	});

	it('allows a VIEWER on a public playlist when the owner chose editPolicy EVERYONE', () => {
		assert.equal(
			decidePlaylistEdit(playlist({ visibility: 'PUBLIC', members: [{ role: 'VIEWER' }] }), MEMBER),
			true
		);
	});

	it('allows any user on a public playlist with editPolicy EVERYONE', () => {
		assert.equal(decidePlaylistEdit(playlist({ visibility: 'PUBLIC' }), STRANGER), true);
	});

	it('denies a VIEWER on a public playlist when the owner chose INVITED_ONLY', () => {
		assert.equal(
			decidePlaylistEdit(
				playlist({ visibility: 'PUBLIC', editPolicy: 'INVITED_ONLY', members: [{ role: 'VIEWER' }] }),
				MEMBER
			),
			false
		);
	});

	it('denies a stranger on a private playlist even with editPolicy EVERYONE', () => {
		assert.equal(decidePlaylistEdit(playlist({ editPolicy: 'EVERYONE' }), STRANGER), false);
	});

	it('allows a member on a private playlist with editPolicy EVERYONE', () => {
		assert.equal(
			decidePlaylistEdit(playlist({ editPolicy: 'EVERYONE', members: [{ role: 'VIEWER' }] }), MEMBER),
			true
		);
	});

	it('denies a non-member on a public playlist when the policy is INVITED_ONLY', () => {
		assert.equal(
			decidePlaylistEdit(playlist({ visibility: 'PUBLIC', editPolicy: 'INVITED_ONLY' }), STRANGER),
			false
		);
	});
});

describe('decideEventRead / decideEventEdit', () => {
	const base = { ownerId: OWNER, visibility: 'PUBLIC' as const, members: [] as unknown[] };

	it('lets the owner read and edit', () => {
		assert.equal(decideEventRead(base, OWNER), true);
		assert.equal(decideEventEdit({ ownerId: OWNER, members: [] }, OWNER), true);
	});

	it('lets anyone read a public event but not edit it', () => {
		assert.equal(decideEventRead(base, STRANGER), true);
		assert.equal(decideEventEdit({ ownerId: OWNER, members: [] }, STRANGER), false);
	});

	it('denies reading a private event to a stranger', () => {
		assert.equal(decideEventRead({ ...base, visibility: 'PRIVATE' }, STRANGER), false);
	});

	it('lets a member read a private event', () => {
		assert.equal(decideEventRead({ ...base, visibility: 'PRIVATE', members: [{}] }, MEMBER), true);
	});
});

const event = (overrides: Partial<EventVotingAuthRow> = {}): EventVotingAuthRow => ({
	ownerId: OWNER,
	votingPolicy: 'LOCATION_TIME',
	latitude: VENUE.latitude,
	longitude: VENUE.longitude,
	radius: 100,
	startAt: null,
	endAt: null,
	members: [],
	...overrides,
});

describe('decideEventVotingAccess - EVERYONE', () => {
	it('allows any user, even outside the radius and with no position', () => {
		assert.equal(decideEventVotingAccess(event({ votingPolicy: 'EVERYONE' }), STRANGER, null).allowed, true);
	});
});

describe('decideEventVotingAccess - INVITED_ONLY', () => {
	it('allows the owner and an accepted member', () => {
		const e = event({ votingPolicy: 'INVITED_ONLY', members: [{ userId: MEMBER }] });
		assert.equal(decideEventVotingAccess(e, OWNER, null).allowed, true);
		assert.equal(decideEventVotingAccess(e, MEMBER, null).allowed, true);
	});

	it('denies a stranger', () => {
		const access = decideEventVotingAccess(event({ votingPolicy: 'INVITED_ONLY' }), STRANGER, VENUE);
		assert.deepEqual(access, { allowed: false, reason: 'NOT_A_MEMBER' });
	});
});

describe('decideEventVotingAccess - LOCATION_TIME', () => {
	const memberEvent = (overrides: Partial<EventVotingAuthRow> = {}) =>
		event({ members: [{ userId: MEMBER }], ...overrides });

	it('allows a member inside the radius', () => {
		assert.equal(decideEventVotingAccess(memberEvent(), MEMBER, VENUE).allowed, true);
	});

	it('denies a non-member before considering the position', () => {
		assert.deepEqual(decideEventVotingAccess(event(), STRANGER, VENUE), {
			allowed: false,
			reason: 'NOT_A_MEMBER',
		});
	});

	it('denies a member outside the radius and reports the distance', () => {
		const access = decideEventVotingAccess(memberEvent(), MEMBER, { latitude: 48.87, longitude: 2.37 });
		assert.equal(access.allowed, false);
		if (!access.allowed) {
			assert.equal(access.reason, 'LOCATION_OUT_OF_RADIUS');
			assert.ok((access.distanceMeters ?? 0) > 100);
			assert.equal(access.radiusMeters, 100);
		}
	});

	it('denies a member with no or partial position', () => {
		assert.deepEqual(decideEventVotingAccess(memberEvent(), MEMBER, null), {
			allowed: false,
			reason: 'INVALID_LOCATION',
		});
		assert.deepEqual(decideEventVotingAccess(memberEvent(), MEMBER, { latitude: 48.8566 }), {
			allowed: false,
			reason: 'INVALID_LOCATION',
		});
	});

	it('denies out-of-range coordinates', () => {
		assert.equal(decideEventVotingAccess(memberEvent(), MEMBER, { latitude: 91, longitude: 2 }).allowed, false);
		assert.equal(decideEventVotingAccess(memberEvent(), MEMBER, { latitude: 48, longitude: 181 }).allowed, false);
	});

	it('denies when the event has no coordinates configured', () => {
		const access = decideEventVotingAccess(memberEvent({ latitude: null }), MEMBER, VENUE);
		assert.deepEqual(access, { allowed: false, reason: 'LOCATION_OUT_OF_RADIUS' });
	});

	it('denies before the window opens', () => {
		const access = decideEventVotingAccess(
			memberEvent({ startAt: new Date(Date.now() + 3_600_000) }),
			MEMBER,
			VENUE
		);
		assert.deepEqual(access, { allowed: false, reason: 'OUTSIDE_TIME_WINDOW' });
	});

	it('denies after the window closed', () => {
		const access = decideEventVotingAccess(
			memberEvent({
				startAt: new Date(Date.now() - 7_200_000),
				endAt: new Date(Date.now() - 3_600_000),
			}),
			MEMBER,
			VENUE
		);
		assert.deepEqual(access, { allowed: false, reason: 'OUTSIDE_TIME_WINDOW' });
	});

	it('allows inside the window', () => {
		const e = memberEvent({
			startAt: new Date(Date.now() - 3_600_000),
			endAt: new Date(Date.now() + 3_600_000),
		});
		assert.equal(decideEventVotingAccess(e, MEMBER, VENUE).allowed, true);
	});

	// Regression: creation only requires coordinates, so an event created without a
	// time window must stay votable instead of being permanently closed.
	it('allows when the event has no time window at all', () => {
		assert.equal(decideEventVotingAccess(memberEvent({ startAt: null, endAt: null }), MEMBER, VENUE).allowed, true);
	});

	it('treats the owner like any other member', () => {
		assert.equal(decideEventVotingAccess(event(), OWNER, VENUE).allowed, true);
	});
});

describe('decideDeviceManage / decideDeviceControl', () => {
	const device = { ownerId: OWNER, revokedAt: null as Date | null, permissions: [] as unknown[] };

	it('lets the owner manage and control', () => {
		assert.equal(decideDeviceManage(device, OWNER), true);
		assert.equal(decideDeviceControl(device, OWNER), true);
	});

	it('denies a stranger', () => {
		assert.equal(decideDeviceManage(device, STRANGER), false);
		assert.equal(decideDeviceControl(device, STRANGER), false);
	});

	it('denies everyone once the device is revoked', () => {
		const revoked = { ...device, revokedAt: new Date() };
		assert.equal(decideDeviceManage(revoked, OWNER), false);
		assert.equal(decideDeviceControl(revoked, OWNER), false);
	});

	it('grants control to a delegate holding a CONTROL permission', () => {
		const delegated = { ...device, permissions: [{ delegateUserId: STRANGER }] };
		assert.equal(decideDeviceControl(delegated, STRANGER), true);
		assert.equal(decideDeviceManage(delegated, STRANGER), false, 'delegation grants control, not management');
	});

	it('denies a missing device', () => {
		assert.equal(decideDeviceManage(null, OWNER), false);
		assert.equal(decideDeviceControl(null, OWNER), false);
	});
});
