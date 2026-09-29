import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { z } from 'zod';
import { parseBody } from './parsing';

const jsonRequest = (payload: unknown): Request =>
	new Request('http://localhost/api/test', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});

const statusOf = async (promise: Promise<unknown>): Promise<number> => {
	try {
		await promise;
		return 200;
	} catch (error) {
		if (error instanceof Response) return error.status;
		throw error;
	}
};

describe('parseBody', () => {
	const schema = z.object({ playlistId: z.string().min(1), userId: z.string().min(1) }).or(
		z.object({
			playlistId: z.string().min(1),
			username: z.string().min(3),
			role: z.enum(['EDITOR', 'VIEWER']).default('EDITOR'),
		})
	);

	it('accepts a payload matching the first branch of a union', async () => {
		const body = await parseBody<{ playlistId: string }>(jsonRequest({ playlistId: 'p1', userId: 'u1' }), schema);
		assert.equal(body.playlistId, 'p1');
	});

	it('accepts a payload matching the second branch of a union', async () => {
		const body = await parseBody<{ playlistId: string }>(
			jsonRequest({ playlistId: 'p1', username: 'someone' }),
			schema
		);
		assert.equal(body.playlistId, 'p1');
	});

	it('rejects a payload matching neither branch with 400, not 500', async () => {
		assert.equal(await statusOf(parseBody(jsonRequest({ playlistId: 'p1', role: 'ADMIN' }), schema)), 400);
		assert.equal(await statusOf(parseBody(jsonRequest({}), schema)), 400);
		assert.equal(await statusOf(parseBody(jsonRequest({ playlistId: 'p1', username: 'ab' }), schema)), 400);
	});

	it('rejects a root-level refinement failure with 400', async () => {
		const refined = z.object({ a: z.string() }).refine(() => false, { message: 'nope' });
		assert.equal(await statusOf(parseBody(jsonRequest({ a: 'x' }), refined)), 400);
	});

	it('rejects a non-JSON content type', async () => {
		const req = new Request('http://localhost/api/test', { method: 'POST', body: 'a=1' });
		assert.notEqual(await statusOf(parseBody(req, schema)), 200);
	});

	it('reports a missing field as a missing parameter', async () => {
		assert.equal(await statusOf(parseBody(jsonRequest({ playlistId: 'p1' }), schema)), 400);
	});
});
