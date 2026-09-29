import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isPreviewFresh, previewExpiryMs } from './preview-freshness';

const signed = (exp: number) =>
	`https://cdnt-preview.dzcdn.net/api/1/1/3/6/e/0/hash.mp3?hdnea=exp=${exp}~acl=/api/1/1/3/6/e/0/hash.mp3*~data=user_id=0,application_id=42~hmac=deadbeef`;

const NOW = 1_790_546_988_000;

describe('previewExpiryMs', () => {
	it('reads the signed deadline as an absolute time', () => {
		assert.equal(previewExpiryMs(signed(1_790_546_988)), NOW);
	});

	it('accepts & and end-of-string as delimiters', () => {
		assert.equal(previewExpiryMs('https://x/a.mp3?exp=100&y=1'), 100_000);
		assert.equal(previewExpiryMs('https://x/a.mp3?exp=100'), 100_000);
	});

	it('returns null when there is no deadline to read', () => {
		assert.equal(previewExpiryMs('https://x/a.mp3'), null);
		assert.equal(previewExpiryMs(null), null);
		assert.equal(previewExpiryMs(undefined), null);
	});

	it('does not read a prefix of a malformed value', () => {
		assert.equal(previewExpiryMs('https://x/a.mp3?hdnea=exp=1e999~hmac=x'), null);
	});
});

describe('isPreviewFresh', () => {
	it('is fresh while the deadline is in the future', () => {
		assert.equal(isPreviewFresh(signed(1_790_546_989), NOW), true);
	});

	it('is stale once the deadline has passed', () => {
		assert.equal(isPreviewFresh(signed(1_790_546_987), NOW), false);
	});

	it('is stale exactly at the deadline', () => {
		assert.equal(isPreviewFresh(signed(1_790_546_988), NOW), false);
	});

	it('is stale when there is no URL at all', () => {
		assert.equal(isPreviewFresh(null, NOW), false);
		assert.equal(isPreviewFresh(undefined, NOW), false);
		assert.equal(isPreviewFresh('', NOW), false);
	});

	it('is stale when the deadline cannot be read', () => {
		assert.equal(isPreviewFresh('https://x/a.mp3', NOW), false);
		assert.equal(isPreviewFresh('https://x/a.mp3?hdnea=exp=1e999~hmac=x', NOW), false);
	});
});
