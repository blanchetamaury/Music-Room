import * as bcrypt from 'bcrypt';
import { createCsrfCookie } from '../../lib/csrf';
import { createAndSetSession } from '../../lib/session';
import { countRateLimitLoginByIp, countRateLimitLoginByUserId, createRateLimitLogin } from '../../prisma/ratelimitLogin';
import { getUserByMail } from '../../prisma/user';
import { LoginParametersSchema } from '../../schema/LoginParamtersSchema';
import { errorHandler, ERRORS_DETAILS } from '../../utils/error';
import { parseBody } from '../../utils/parsing';
import { LoginParameters } from '../../types/auth/LoginParameters';

const MAX_ATTEMPTS_PER_ACCOUNT = 5;
const MAX_ATTEMPTS_PER_IP = 20;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const body = await parseBody<LoginParameters>(req, LoginParametersSchema);
		const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';

		const user = await getUserByMail(body.mail, { fortytwo_oauth: true });

		const ipAttempts = await countRateLimitLoginByIp(ip, false, WINDOW_MS);
		if (ipAttempts >= MAX_ATTEMPTS_PER_IP) {
			throw ERRORS_DETAILS.too_many_attempts();
		}

		if (user) {
			const accountAttempts = await countRateLimitLoginByUserId(user.id, false, WINDOW_MS);
			if (accountAttempts >= MAX_ATTEMPTS_PER_ACCOUNT) {
				throw ERRORS_DETAILS.too_many_attempts();
			}
		}

		const DUMMY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8G6wG6r9U2p8XdG.6ub2u8QY6l5J6O';
		const password_ok = await bcrypt.compare(body.password, user?.passwordHash ?? DUMMY_HASH);

		if (!user || !user.passwordHash || !password_ok) {
			if (user) await createRateLimitLogin(user.id, ip, false);
			throw ERRORS_DETAILS.invalid_mail_password();
		}

		if (user.fortytwo_oauth) {
			await createRateLimitLogin(user.id, ip, false);
			throw ERRORS_DETAILS.two_factor_auth_required();
		}

		await createRateLimitLogin(user.id, ip, true);

		const sessionCookie = await createAndSetSession({
			user_id: user.id
		});

		const { cookie: csrfCookie } = createCsrfCookie();

		const headers = new Headers();
		headers.append('Set-Cookie', sessionCookie);
		headers.append('Set-Cookie', csrfCookie);

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers,
		});
	});
}