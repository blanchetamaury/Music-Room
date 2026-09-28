import { getUserFromToken } from '../utils/token';
import { ERRORS_DETAILS } from '../utils/error';
import { consume, type RateLimitRule } from './rate-limit';

const clientIdentity = (req: Request): string => {
	const forwarded = req.headers.get('x-forwarded-for');
	if (forwarded) {
		const first = forwarded.split(',')[0]?.trim();
		if (first) return `ip:${first}`;
	}
	return `ip:${req.headers.get('x-real-ip') ?? 'unknown'}`;
};

export const rateLimit = async (req: Request, rule: RateLimitRule): Promise<Response | null> => {
	const userId = await getUserFromToken(req);
	const identity = userId ? `user:${userId}` : clientIdentity(req);

	const result = consume(rule, identity);

	if (!result.allowed) {
		const response = ERRORS_DETAILS.too_many_attempts();
		response.headers.set('Retry-After', String(result.retryAfterSeconds));
		response.headers.set('X-RateLimit-Limit', String(result.limit));
		response.headers.set('X-RateLimit-Remaining', '0');
		response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));
		return response;
	}

	return null;
};
