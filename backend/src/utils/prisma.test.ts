import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	hasPrismaCode,
	isConcurrencyConflict,
	isForeignKeyViolation,
	isPrismaKnownError,
	isRecordNotFound,
	isUniqueViolation,
	isWriteConflict,
} from './prisma';

const prismaError = (code: string) => ({ code, meta: { target: ['field'] } });

describe('isPrismaKnownError', () => {
	it('accepts anything exposing a string code', () => {
		assert.equal(isPrismaKnownError({ code: 'P2002' }), true);
	});

	it('rejects null, primitives and code-less objects', () => {
		assert.equal(isPrismaKnownError(null), false);
		assert.equal(isPrismaKnownError(undefined), false);
		assert.equal(isPrismaKnownError('P2002'), false);
		assert.equal(isPrismaKnownError(42), false);
		assert.equal(isPrismaKnownError(new Error('boom')), false);
		assert.equal(isPrismaKnownError({ code: 2002 }), false);
	});
});

describe('hasPrismaCode', () => {
	it('matches any of the listed codes', () => {
		assert.equal(hasPrismaCode(prismaError('P2002'), 'P2002', 'P2025'), true);
		assert.equal(hasPrismaCode(prismaError('P2025'), 'P2002', 'P2025'), true);
		assert.equal(hasPrismaCode(prismaError('P1001'), 'P2002', 'P2025'), false);
	});

	it('is false when no code is expected', () => {
		assert.equal(hasPrismaCode(prismaError('P2002')), false);
	});
});

describe('error classifiers', () => {
	it('detects missing records (P2025)', () => {
		assert.equal(isRecordNotFound(prismaError('P2025')), true);
		assert.equal(isRecordNotFound(prismaError('P2002')), false);
	});

	it('detects unique violations (P2002)', () => {
		assert.equal(isUniqueViolation(prismaError('P2002')), true);
		assert.equal(isUniqueViolation(prismaError('P2003')), false);
	});

	it('detects foreign key violations (P2003)', () => {
		assert.equal(isForeignKeyViolation(prismaError('P2003')), true);
		assert.equal(isForeignKeyViolation(prismaError('P2002')), false);
	});

	it('treats transaction conflicts and deadlocks as write conflicts', () => {
		for (const code of ['P2034', 'P2028', 'P2039']) {
			assert.equal(isWriteConflict(prismaError(code)), true, code);
		}
		assert.equal(isWriteConflict(prismaError('P2023')), false);
	});
});

describe('isConcurrencyConflict', () => {
	it('covers both unique violations and write conflicts', () => {
		for (const code of ['P2002', 'P2034', 'P2028', 'P2039']) {
			assert.equal(isConcurrencyConflict(prismaError(code)), true, code);
		}
	});

	it('does not swallow unrelated failures into a 409', () => {
		for (const code of ['P2025', 'P2003', 'P1001', 'P2023', 'P2024']) {
			assert.equal(isConcurrencyConflict(prismaError(code)), false, code);
		}
	});

	it('is false for non-Prisma errors', () => {
		assert.equal(isConcurrencyConflict(new Error('boom')), false);
		assert.equal(isConcurrencyConflict(null), false);
	});
});
