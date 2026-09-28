import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	decideProfileEmail,
	decideProfileRead,
	PROFILE_FIELD_DEFAULTS,
	PROFILE_FIELDS,
	type ProfileField,
	type VisibilityLevel,
} from './permissions';

const OWNER = 'owner';
const FRIEND = 'friend';
const FOLLOWER = 'follower';
const STRANGER = 'stranger';

const view = (field: ProfileField, level: VisibilityLevel, who: string) =>
	decideProfileRead(OWNER, who, field, level, who === FRIEND || who === OWNER);

describe('decideProfileRead', () => {
	it('always lets the owner see their own profile, whatever the setting', () => {
		for (const field of PROFILE_FIELDS) {
			for (const level of ['PUBLIC', 'FRIENDS', 'PRIVATE'] as VisibilityLevel[]) {
				assert.equal(view(field, level, OWNER), true, `${field}/${level}`);
			}
		}
	});

	it('serves PUBLIC fields to anyone', () => {
		assert.equal(view('PROFILE_BASICS', 'PUBLIC', STRANGER), true);
		assert.equal(view('MUSIC_PREFERENCES', 'PUBLIC', STRANGER), true);
	});

	it('hides PRIVATE fields from everyone but the owner', () => {
		for (const who of [FRIEND, FOLLOWER, STRANGER]) {
			assert.equal(view('PLAY_HISTORY', 'PRIVATE', who), false, who);
		}
		assert.equal(view('PLAY_HISTORY', 'PRIVATE', OWNER), true);
	});

	it('grants FRIENDS only to a follower of the owner', () => {
		assert.equal(view('LIKES', 'FRIENDS', FRIEND), true);
		assert.equal(view('LIKES', 'FRIENDS', STRANGER), false);
	});

	it('does not treat being followed back as friendship', () => {
		assert.equal(view('LIKES', 'FRIENDS', FOLLOWER), false);
	});

	it('leaves no field readable by a stranger at its default except the public ones', () => {
		const readable: ProfileField[] = PROFILE_FIELDS.filter((f) => view(f, PROFILE_FIELD_DEFAULTS[f], STRANGER));
		assert.deepEqual(readable.sort(), ['MUSIC_PREFERENCES', 'PLAYLISTS', 'PROFILE_BASICS']);
	});
});

describe('decideProfileEmail', () => {
	it('gives the owner their own address', () => {
		assert.equal(decideProfileEmail(OWNER, OWNER, false, false), true);
	});

	it('requires both readable basics and a follow', () => {
		assert.equal(decideProfileEmail(OWNER, FRIEND, true, true), true);
		assert.equal(decideProfileEmail(OWNER, STRANGER, true, false), false);
		assert.equal(decideProfileEmail(OWNER, FRIEND, false, true), false);
	});
});

describe('PROFILE_FIELD_DEFAULTS', () => {
	it('covers every field exactly once', () => {
		assert.deepEqual([...PROFILE_FIELDS].sort(), [
			'LIKES',
			'MUSIC_PREFERENCES',
			'PLAYLISTS',
			'PLAY_HISTORY',
			'PROFILE_BASICS',
		]);
	});

	it('never opens listening history or likes to the world by default', () => {
		assert.equal(PROFILE_FIELD_DEFAULTS.PLAY_HISTORY, 'PRIVATE');
		assert.equal(PROFILE_FIELD_DEFAULTS.LIKES, 'FRIENDS');
	});
});
