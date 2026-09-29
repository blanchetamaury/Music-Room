import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../generated/client';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;

const poolMax = Number.parseInt(process.env.DATABASE_POOL_MAX ?? '', 10) || 10;

const adapter = new PrismaPg({
	connectionString,
	max: poolMax,
	idleTimeoutMillis: 10_000,
	connectionTimeoutMillis: 10_000,
});

const RETRYABLE_SQLSTATES = new Set([
	'26000', // unnamed prepared statement does not exist
	'34000', // portal does not exist
	'08000', // connection exception
	'08003', // connection does not exist
	'08006', // connection failure
	'08P01', // bind parameter count mismatch on a recycled session
	'57P01', // admin shutdown
	'57P02', // crash shutdown
	'57P03', // cannot connect now
]);

const RETRYABLE_PRISMA_CODES = new Set(['P2039', 'P2028', 'P2034', 'P2023']);

const isRetryableConnectionError = (error: unknown): boolean => {
	if (typeof error !== 'object' || error === null) return false;

	const candidate = error as { code?: unknown; message?: unknown };
	const code = typeof candidate.code === 'string' ? candidate.code : undefined;
	if (code && (RETRYABLE_SQLSTATES.has(code) || RETRYABLE_PRISMA_CODES.has(code))) return true;

	const message = typeof candidate.message === 'string' ? candidate.message : String(error);
	const normalized = message.toLowerCase();
	return (
		normalized.includes('unnamed prepared statement does not exist') ||
		normalized.includes('portal "" does not exist') ||
		normalized.includes('prepared statement') ||
		normalized.includes('terminating connection') ||
		normalized.includes('connection terminated') ||
		normalized.includes('closed the connection') ||
		normalized.includes('connection was closed') ||
		normalized.includes('econnreset') ||
		normalized.includes('epipe') ||
		normalized.includes('timeout exceeded when trying to connect') ||
		normalized.includes('timed out fetching a new connection')
	);
};

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_ATTEMPTS = 4;

const withRetry = async <T>(fn: () => Promise<T>, attempts: number = MAX_ATTEMPTS): Promise<T> => {
	let lastError: unknown;

	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;
			if (attempt === attempts || !isRetryableConnectionError(error)) throw error;
			await sleep(25 * attempt * attempt);
		}
	}

	throw lastError;
};

const baseClient = new PrismaClient({ adapter });

const prisma = baseClient.$extends({
	name: 'resilient-connection',
	query: {
		$allOperations: ({ args, query }) => withRetry(() => query(args) as Promise<unknown>),
	},
});

const runTransaction = async <T>(
	fn: (tx: Prisma.TransactionClient) => Promise<T>,
	attempts: number = MAX_ATTEMPTS
): Promise<T> => {
	return withRetry(() => baseClient.$transaction(fn) as Promise<T>, attempts);
};

export { prisma, isRetryableConnectionError, runTransaction, withRetry, poolMax };
export type { Prisma };
