import { jwtVerify } from 'jose';
import { getSessionSecret } from '../lib/session-secret';
import { isSessionRevoked } from '../../prisma/database/revokedSession';

const SESSION_COOKIE_NAME = 'token';

const extractToken = (req: Request): string | null => {
	const authHeader = req.headers.get('Authorization');

	if (authHeader && authHeader.startsWith('Bearer ')) {
		const token = authHeader.slice(7).trim();
		if (token) return token;
	}

	const cookieHeader = req.headers.get('Cookie');
	if (cookieHeader) {
		const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
		if (match) return match[1];
	}

	return null;
};

const verifySessionToken = async (token: string): Promise<string | null> => {
	try {
		const { payload } = await jwtVerify(token, getSessionSecret(), {
			issuer: 'music room',
			algorithms: ['HS256'],
		});

		if (typeof payload.user_id !== 'string') return null;
		if (typeof payload.jti === 'string' && (await isSessionRevoked(payload.jti))) return null;
		return payload.user_id;
	} catch (err) {
		console.error(`Error to get token ${err}`);
		return null;
	}
};

export async function getUserFromToken(req: Request): Promise<string | null> {
	const token = extractToken(req);
	if (!token) return null;
	return verifySessionToken(token);
}

export async function getSessionPayloadFromRequest(
	req: Request
): Promise<import('../types/session/SessionPayload').JWTSessionPayload | null> {
	try {
		const token = extractToken(req);
		if (!token) return null;

		const { payload } = await jwtVerify(token, getSessionSecret(), {
			issuer: 'music room',
			algorithms: ['HS256'],
		});

		if (typeof payload.user_id !== 'string') return null;
		if (typeof payload.jti === 'string' && (await isSessionRevoked(payload.jti))) return null;
		return payload as import('../types/session/SessionPayload').JWTSessionPayload;
	} catch {
		return null;
	}
}
