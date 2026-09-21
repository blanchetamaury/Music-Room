import { Request, Response } from 'express';
import { SignJWT, jwtVerify } from 'jose';
import { JWTSessionPayload, SessionPayload } from '../types/session/SessionPayload';
import { ERRORS_DETAILS } from '../utils/error';
import { getSessionSecret } from './session-secret';

const SESSION_MAX_AGE_SECONDS = 2 * 60 * 60;
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;

interface CreatedSessionPayload {
	body: string;
	expirationDate: number;
}

const encrypt = async (payload: JWTSessionPayload): Promise<string> => {
	return new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setExpirationTime(payload.exp)
		.sign(getSessionSecret());
};

const decrypt = async (session: string | undefined = ''): Promise<JWTSessionPayload> => {
	const { payload } = await jwtVerify(session, getSessionSecret(), {
		algorithms: ['HS256'],
		issuer: 'music room',
	});
	if (payload.exp != null && Date.now() / 1000 >= payload.exp) {
		throw new Error('Error, session cookie is not set');
	}
	return payload as JWTSessionPayload;
};

const createSession = async (payload: SessionPayload): Promise<CreatedSessionPayload> => {
	const issuedAt = Math.floor(Date.now() / 1000);
	const expirationTime = issuedAt + SESSION_MAX_AGE_SECONDS;
	const expirationDate = expirationTime * 1000;
	const body = await encrypt({
		...payload,
		iat: issuedAt,
		iss: 'music room',
		exp: expirationTime,
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
	return `token=${session.body}; HttpOnly; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax`;
};

const getTokenFromRequest = (req: Request): string | null => {
	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith('Bearer ')) {
		return authHeader.slice(7).trim();
	}

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
	SESSION_MAX_AGE_SECONDS, createAndSetSession,
	createSession,
	decrypt,
	encrypt,
	getSession,
	getThrowableSession,
	parseUserId,
	setSession
};

