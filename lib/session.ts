import { ERRORS_DETAILS } from '@/src/server/utils/error';
import { JWTSessionPayload, SessionPayload } from '@/types/session/SessionPayload';
import * as SecureStore from 'expo-secure-store';
import { SignJWT, jwtVerify } from 'jose';

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET);

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
		exp: expirationDate,
		iat: Date.now(),
		iss: 'BDE-42',
		...payload,
	});
	return { body, expirationDate };
};

const setSession = async (session: CreatedSessionPayload, response: Response): Promise<void> => {
    response.headers.append(
        'Set-Cookie',
        `session=${session.body}; HttpOnly; Path=/; Max-Age=${2 * 60 * 60}; SameSite=Lax; Secure`
    );
};

const unsetSession = async (): Promise<void> => {
	const sessionCookie = await SecureStore.getItemAsync('session');

	if (!sessionCookie) return;
	await SecureStore.deleteItemAsync('session');
};

const createAndSetSession = async (payload: SessionPayload): Promise<string> => {
    const session = await createSession(payload);
    return `session=${session.body}; HttpOnly; Path=/; Max-Age=${2 * 60 * 60}; SameSite=Lax`;
};

const getSession = async (req: Request): Promise<SessionPayload | null> => {
	try {
		const cookie = await SecureStore.getItemAsync('session');
		if (cookie === null) return null;
		const session = await decrypt(cookie);
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
	createAndSetSession, createSession, decrypt, encrypt, getSession,
	getThrowableSession,
	parseUserId, setSession,
	unsetSession
};
