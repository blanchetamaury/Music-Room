import { Prisma } from '../generated/client';
import { prisma } from './prisma';
import { createHash, randomBytes } from 'crypto';

const CODE_TTL_MS = 60 * 1000;

const generateCode = (): string => randomBytes(32).toString('hex');

const hashCode = (code: string): string => createHash('sha256').update(code).digest('hex');

const createSessionExchange = async (
	userId: string,
	clientType: string | null,
	ttlMs: number = CODE_TTL_MS
): Promise<{ id: string; code: string; expiresAt: Date }> => {
	const code = generateCode();
	const expiresAt = new Date(Date.now() + ttlMs);

	const created = await prisma.sessionExchange.create({
		data: { userId, codeHash: hashCode(code), clientType, expiresAt },
		select: { id: true },
	});

	return { id: created.id, code, expiresAt };
};

const consumeSessionExchange = async (
	code: string
): Promise<Prisma.SessionExchangeGetPayload<Prisma.SessionExchangeDefaultArgs> | null> => {
	const claimed = await prisma.sessionExchange.updateManyAndReturn({
		where: { codeHash: hashCode(code), usedAt: null, expiresAt: { gt: new Date() } },
		data: { usedAt: new Date() },
	});

	return claimed[0] ?? null;
};

const CLEANUP_INTERVAL_MS = 60 * 1000;
let lastCleanupAt = 0;

const deleteExpiredSessionExchanges = async (): Promise<void> => {
	if (Date.now() - lastCleanupAt < CLEANUP_INTERVAL_MS) return;
	lastCleanupAt = Date.now();

	try {
		await prisma.sessionExchange.deleteMany({
			where: { OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }] },
		});
	} catch {
		lastCleanupAt = 0;
	}
};

export {
	createSessionExchange,
	consumeSessionExchange,
	deleteExpiredSessionExchanges,
	generateCode,
	hashCode,
	CODE_TTL_MS,
};
