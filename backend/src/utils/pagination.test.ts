import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DEFAULT_PAGINATION, generatePaginationResponse, getPaginationParams, paginationToPrisma } from './pagination';

describe('getPaginationParams', () => {
	it('falls back to the defaults', () => {
		const params = getPaginationParams(new URLSearchParams(''));
		assert.deepEqual(params, { page: 1, limit: 20 });
	});

	it('reads page and limit', () => {
		assert.deepEqual(getPaginationParams(new URLSearchParams('page=3&limit=50')), {
			page: 3,
			limit: 50,
		});
	});

	it('ignores out-of-range limits and keeps the default', () => {
		assert.equal(getPaginationParams(new URLSearchParams('limit=0')).limit, 20);
		assert.equal(getPaginationParams(new URLSearchParams('limit=101')).limit, 20);
		assert.equal(getPaginationParams(new URLSearchParams('limit=-5')).limit, 20);
		assert.equal(getPaginationParams(new URLSearchParams('limit=abc')).limit, 20);
	});

	it('accepts the limit boundaries', () => {
		assert.equal(getPaginationParams(new URLSearchParams('limit=1')).limit, 1);
		assert.equal(getPaginationParams(new URLSearchParams('limit=100')).limit, 100);
	});

	it('rejects non-positive pages', () => {
		assert.equal(getPaginationParams(new URLSearchParams('page=0')).page, 1);
		assert.equal(getPaginationParams(new URLSearchParams('page=-2')).page, 1);
		assert.equal(getPaginationParams(new URLSearchParams('page=nope')).page, 1);
	});

	it('does not leak one request params into the next', () => {
		getPaginationParams(new URLSearchParams('page=7&limit=99'));
		assert.deepEqual(DEFAULT_PAGINATION, { page: 1, limit: 20 });
		assert.deepEqual(getPaginationParams(new URLSearchParams('')), { page: 1, limit: 20 });
	});
});

describe('paginationToPrisma', () => {
	it('skips whole pages', () => {
		assert.deepEqual(paginationToPrisma({ page: 1, limit: 20 }), { take: 20, skip: 0 });
		assert.deepEqual(paginationToPrisma({ page: 2, limit: 20 }), { take: 20, skip: 20 });
		assert.deepEqual(paginationToPrisma({ page: 4, limit: 25 }), { take: 25, skip: 75 });
	});
});

describe('generatePaginationResponse', () => {
	it('reports the page metadata', () => {
		const result = generatePaginationResponse(['a', 'b'], 45, { page: 2, limit: 20 });
		assert.deepEqual(result, { data: ['a', 'b'], page: 2, page_size: 20, total_pages: 3 });
	});

	it('never reports zero total pages', () => {
		assert.equal(generatePaginationResponse([], 0, { page: 1, limit: 20 }).total_pages, 1);
	});

	it('rounds the page count up', () => {
		assert.equal(generatePaginationResponse([], 21, { page: 1, limit: 20 }).total_pages, 2);
		assert.equal(generatePaginationResponse([], 20, { page: 1, limit: 20 }).total_pages, 1);
	});
});
