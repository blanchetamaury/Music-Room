import { randomBytes } from 'crypto';

const CSRF_COOKIE_NAME = 'csrf_token';

export function generateCsrfToken(): string {
	return randomBytes(32).toString('hex');
}

export function createCsrfCookie(): { token: string; cookie: string } {
	const token = generateCsrfToken();
	const cookie = `${CSRF_COOKIE_NAME}=${token}; Path=/; SameSite=Strict; Max-Age=${60 * 60 * 24}`;
	return { token, cookie };
}

type HeaderSource = { headers: Headers } | { headers: Record<string, unknown> };

const readHeader = (req: HeaderSource, name: string): string | undefined => {
	const headers = req.headers as Headers & Record<string, unknown>;

	if (typeof (headers as Headers).get === 'function') {
		return (headers as Headers).get(name) ?? undefined;
	}

	const value = (headers as Record<string, unknown>)[name.toLowerCase()];
	return Array.isArray(value) ? value.join(', ') : (value as string | undefined);
};

const readCookieHeader = (req: HeaderSource): string => readHeader(req, 'cookie') ?? '';

export function getCsrfTokenFromRequest(req: HeaderSource): string | null {
	const match = readCookieHeader(req).match(new RegExp(`${CSRF_COOKIE_NAME}=([^;]+)`));
	return match ? match[1] : null;
}

export function hasBearerToken(req: HeaderSource): boolean {
	const header = readHeader(req, 'authorization');
	return typeof header === 'string' && header.startsWith('Bearer ');
}

export function verifyCsrf(req: HeaderSource): boolean {
	if (hasBearerToken(req)) return true;

	const cookieToken = getCsrfTokenFromRequest(req);
	const headerToken = readHeader(req, 'x-csrf-token');

	if (!cookieToken || !headerToken) return false;
	if (cookieToken !== headerToken) return false;

	return true;
}
