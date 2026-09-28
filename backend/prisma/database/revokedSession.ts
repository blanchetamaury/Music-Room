import { prisma } from './prisma';
import type { JWTSessionPayload } from '../../src/types/session/SessionPayload';

export const revokeSession = async (jti: string, userId: string | undefined, expiresAt: number): Promise<void> => {
	await prisma.revokedSession.upsert({
		where: { jti },
		create: { jti, userId: userId ?? null, expiresAt: new Date(expiresAt * 1000) },
		update: { revokedAt: new Date() },
	});
};

export const isSessionRevoked = async (jti: string): Promise<boolean> => {
	const row = await prisma.revokedSession.findUnique({ where: { jti }, select: { jti: true } });
	return row !== null;
};

export const revokeSessionFromPayload = async (payload: JWTSessionPayload): Promise<void> => {
	if (typeof payload.jti !== 'string') return;
	await revokeSession(payload.jti, payload.user_id, payload.exp);
};

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanupAt = 0;

export const deleteExpiredRevocations = async (): Promise<void> => {
	if (Date.now() - lastCleanupAt < CLEANUP_INTERVAL_MS) return;
	lastCleanupAt = Date.now();

	try {
		// Past its own expiry the JWT is rejected anyway, so the denylist entry is useless.
		await prisma.revokedSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
	} catch {
		lastCleanupAt = 0;
	}
};
