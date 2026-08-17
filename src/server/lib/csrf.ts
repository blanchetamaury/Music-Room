import { randomBytes } from 'crypto';
import { Request } from 'express';

const CSRF_COOKIE_NAME = 'csrf_token';

export function generateCsrfToken(): string {
    return randomBytes(32).toString('hex');
}

export function createCsrfCookie(): { token: string; cookie: string } {
    const token = generateCsrfToken();
    const cookie = `${CSRF_COOKIE_NAME}=${token}; Path=/; SameSite=Strict; Max-Age=${60 * 60 * 24}`;
    return { token, cookie };
}

export function getCsrfTokenFromRequest(req: Request): string | null {
    const cookieHeader = req.headers.cookie ?? '';
    const match = cookieHeader.match(new RegExp(`${CSRF_COOKIE_NAME}=([^;]+)`));
    return match ? match[1] : null;
}

export function verifyCsrf(req: Request): boolean {
    const cookieToken = getCsrfTokenFromRequest(req);
    const headerToken = req.headers['x-csrf-token'];

    if (!cookieToken || !headerToken) return false;
    if (cookieToken !== headerToken) return false;

    return true;
}