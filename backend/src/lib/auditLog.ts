import { NextFunction, Request as ExpressRequest, Response } from 'express';
import { randomUUID } from 'crypto';
import { createAuditLog } from '../../prisma/database/auditLog';
import { getUserFromToken } from '../utils/token';

declare global {
	namespace Express {
		interface Request {
			requestId?: string;
			userId?: string | null;
		}
	}
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const getClientInfo = (req: ExpressRequest) => ({
	platform: req.headers['x-client-platform'] as string | undefined,
	deviceId: req.headers['x-device-id'] as string | undefined,
	deviceModel: req.headers['x-device-model'] as string | undefined,
	appVersion: req.headers['x-app-version'] as string | undefined,
	ip: req.ip || req.socket.remoteAddress,
});

export const requestIdMiddleware = (req: ExpressRequest, res: Response, next: NextFunction) => {
	const requestId = (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
	req.requestId = requestId;
	res.setHeader('X-Request-Id', requestId);
	console.log(`[${requestId}] ${req.method} ${req.originalUrl}`);
	next();
};

export const resolveUserMiddleware = (req: ExpressRequest, _res: Response, next: NextFunction) => {
	void (async () => {
		try {
			const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
			const headers = new Headers();
			for (const [key, value] of Object.entries(req.headers)) {
				if (value !== undefined) headers.append(key, Array.isArray(value) ? value.join(', ') : value);
			}
			req.userId = await getUserFromToken(new Request(url, { method: req.method, headers }));
		} catch {
			req.userId = null;
		} finally {
			next();
		}
	})();
};

const SKIP_AUDIT_PATHS = [/^\/docs/, /^\/openapi\.yaml$/, /^\/health$/];

export const auditMiddleware = (req: ExpressRequest, res: Response, next: NextFunction) => {
	const path = req.path.replace(/^\/api/, '') || '/';

	if (SAFE_METHODS.has(req.method) || SKIP_AUDIT_PATHS.some((re) => re.test(path))) {
		return next();
	}

	res.on('finish', () => {
		const clientInfo = getClientInfo(req);
		const segments = path.split('/').filter(Boolean);

		createAuditLog({
			userId: req.userId ?? undefined,
			action: `${req.method} ${segments.slice(0, 2).join('/') || '/'}`,
			resourceType: segments[0],
			resourceId: segments[1],
			platform: clientInfo.platform,
			deviceId: clientInfo.deviceId,
			deviceModel: clientInfo.deviceModel,
			appVersion: clientInfo.appVersion,
			ip: clientInfo.ip,
			success: res.statusCode >= 200 && res.statusCode < 400,
			statusCode: res.statusCode,
			requestId: req.requestId ?? randomUUID(),
		}).catch((err) => console.error('Audit log error:', err));
	});

	next();
};
