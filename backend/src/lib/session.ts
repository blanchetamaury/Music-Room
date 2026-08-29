import { Request, Response } from 'express';
import { SignJWT, jwtVerify } from 'jose';
import { JWTSessionPayload, SessionPayload } from '../types/session/SessionPayload';
import { ERRORS_DETAILS } from '../utils/error';
import { createCsrfCookie } from './csrf';

const encodedKey = new TextEncoder().encode(
	process.env.SESSION_SECRET || 'fvsdvsdvoewfk3i4r4i5t984-0qwkdpwekopdp34rf3j4fijr'
);
const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000;

interface CreatedSessionPayload {
	body: string;
	expirationDate: number;
}

const encrypt = async (payload: JWTSessionPayload): Promise<string> => {
	return new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(payload.exp)
		.sign(encodedKey);
};

const decrypt = async (session: string | undefined = ''): Promise<JWTSessionPayload> => {
	const { payload } = await jwtVerify(session, encodedKey, {
		algorithms: ['HS256'],
	});
	if (payload.exp != null && Date.now() / 1000 >= payload.exp) {
		throw new Error('Error, session cookie is not set');
	}
	return payload as JWTSessionPayload;
};

const createSession = async (payload: SessionPayload): Promise<CreatedSessionPayload> => {
	const expirationDate = Date.now() + 2 * 60 * 60 * 1000;
	const body = await encrypt({
		exp: Math.floor(expirationDate / 1000),
		iat: Math.floor(Date.now() / 1000),
		iss: 'music room',
		...payload,
	});
	return { body, expirationDate };
};

const setSession = async (session: CreatedSessionPayload, response: Response): Promise<void> => {
	response.cookie('token', session.body, {
		httpOnly: true,
		path: '/',
		maxAge: SESSION_MAX_AGE_MS,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
	});
};

const createAndSetSession = async (payload: SessionPayload): Promise<string> => {
	const session = await createSession(payload);
	return `token=${session.body}; HttpOnly; Path=/; Max-Age=${2 * 60 * 60}; SameSite=Lax`;
};

const getTokenFromRequest = (req: Request): string | null => {
	// 1. Essaie d'abord le header Authorization (mobile / API clients)
	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith('Bearer ')) {
		return authHeader.slice(7).trim();
	}

	// 2. Sinon, essaie le cookie (web)
	const cookieHeader = req.headers.cookie;
	if (cookieHeader) {
		const match = cookieHeader.match(/token=([^;]+)/);
		if (match) return match[1];
	}

	return null;
};

const getSession = async (req: Request): Promise<SessionPayload | null> => {
	try {
		const token = getTokenFromRequest(req);
		if (!token) return null;
		const session = await decrypt(token);
		if (Date.now() / 1000 >= session.exp) return null;
		return session;
	} catch (err: unknown) {
		console.error(err);
		return null;
	}
};

const getThrowableSession = async (req: Request): Promise<SessionPayload> => {
	const session = await getSession(req);
	if (!session) throw ERRORS_DETAILS.session_expired();
	return session;
};

const parseUserId = (id: string, session: SessionPayload): { id: string; is_me: boolean } => {
	if (id === 'me') {
		return { id: session.user_id, is_me: true };
	}
	return { id: id, is_me: session.user_id === id };
};

export {
	createAndSetSession,
	createSession,
	decrypt,
	encrypt,
	getSession,
	getThrowableSession,
	parseUserId,
	setSession,
};
