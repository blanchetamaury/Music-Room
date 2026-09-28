import { NextFunction, Request, Response } from 'express';
import { createCsrfCookie, getCsrfTokenFromRequest, hasBearerToken, verifyCsrf } from './csrf';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const AUTH_COOKIE_NAME = 'token';

const hasAuthCookie = (req: Request): boolean => {
	const cookieHeader = req.headers.cookie ?? '';
	return new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=`).test(cookieHeader);
};

export const issueCsrfCookieMiddleware = (req: Request, res: Response, next: NextFunction) => {
	if (!getCsrfTokenFromRequest(req)) {
		const { cookie } = createCsrfCookie();
		res.append('Set-Cookie', cookie);
	}

	next();
};

export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
	if (SAFE_METHODS.has(req.method)) return next();
	if (hasBearerToken(req)) return next();
	if (!hasAuthCookie(req)) return next();

	if (!verifyCsrf(req)) {
		return res.status(403).json({ success: false, message: 'Invalid CSRF token' });
	}

	next();
};
