import * as bcrypt from 'bcrypt';
import {
	countRateLimitLoginByIp,
	countRateLimitLoginByUserId,
	createRateLimitLogin,
} from '../../../prisma/database/ratelimitLogin';
import { getUserByMail } from '../../../prisma/database/user';
import { createCsrfCookie } from '../../lib/csrf';
import { createSession } from '../../lib/session';
import { LoginParametersSchema } from '../../schema/LoginParamtersSchema';
import { LoginParameters } from '../../types/auth/LoginParameters';
import { errorHandler, ERRORS_DETAILS } from '../../utils/error';
import { parseBody } from '../../utils/parsing';

const MAX_ATTEMPTS_PER_ACCOUNT = 5;
const MAX_ATTEMPTS_PER_IP = 20;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const body = await parseBody<LoginParameters>(req, LoginParametersSchema);
		const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';

		const user = await getUserByMail(body.mail, { fortytwoOauth: true });

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

		if (user.fortytwoOauth) {
			await createRateLimitLogin(user.id, ip, false);
			throw ERRORS_DETAILS.two_factor_auth_required();
		}

		await createRateLimitLogin(user.id, ip, true);

		const session = await createSession({ user_id: user.id });

		const { cookie: csrfCookie } = createCsrfCookie();

		const headers = new Headers();
		headers.append('Set-Cookie', csrfCookie);
		headers.append('Set-Cookie', `token=${session.body}; HttpOnly; Path=/; Max-Age=${2 * 60 * 60}; SameSite=Lax`);
		headers.append('Content-Type', 'application/json');

		return new Response(
			JSON.stringify({
				success: true,
				token: session.body,
				user: { id: user.id, email: user.email },
			}),
			{
				status: 200,
				headers,
			}
		);
	});
}
