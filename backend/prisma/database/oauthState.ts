import { createHash, randomBytes } from 'crypto';
import { prisma } from './prisma';

const STATE_TTL_MS = 10 * 60 * 1000;

export type OAuthProviderName = 'GOOGLE' | 'FORTYTWO';

export const generateState = (): string => randomBytes(32).toString('base64url');

export const hashState = (state: string): string => createHash('sha256').update(state).digest('hex');

export interface CreatedOAuthState {
	state: string;
	expiresAt: Date;
}

export const createOAuthState = async (data: {
	provider: OAuthProviderName;
	clientType: string;
	linkUserId?: string | null;
	ttlMs?: number;
}): Promise<CreatedOAuthState> => {
	const state = generateState();
	const expiresAt = new Date(Date.now() + (data.ttlMs ?? STATE_TTL_MS));

	await prisma.oauthState.create({
		data: {
			stateHash: hashState(state),
			provider: data.provider,
			clientType: data.clientType,
			linkUserId: data.linkUserId ?? null,
			expiresAt,
		},
	});

	return { state, expiresAt };
};

export interface ConsumedOAuthState {
	provider: OAuthProviderName;
	clientType: string;
	linkUserId: string | null;
}

export const consumeOAuthState = async (state: string): Promise<ConsumedOAuthState | null> => {
	const claimed = await prisma.oauthState.updateManyAndReturn({
		where: { stateHash: hashState(state), usedAt: null, expiresAt: { gt: new Date() } },
		data: { usedAt: new Date() },
		select: { provider: true, clientType: true, linkUserId: true },
	});

	const row = claimed[0];
	if (!row) return null;
	return { provider: row.provider, clientType: row.clientType, linkUserId: row.linkUserId };
};

const CLEANUP_INTERVAL_MS = 60 * 1000;
let lastCleanupAt = 0;

export const deleteExpiredOAuthStates = async (): Promise<void> => {
	if (Date.now() - lastCleanupAt < CLEANUP_INTERVAL_MS) return;
	lastCleanupAt = new Date().getTime();

	try {
		await prisma.oauthState.deleteMany({
			where: { OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }] },
		});
	} catch {
		lastCleanupAt = 0;
	}
};

export { STATE_TTL_MS };
