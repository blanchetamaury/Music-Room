import { createOrUpdateFortyTwoUser } from '../../../../prisma/database/user';
import { createCsrfCookie } from '../../../lib/csrf';
import { createSession, SESSION_MAX_AGE_SECONDS } from '../../../lib/session';
import { getFortyTwoMe, getFortyTwoOauthToken } from '../../../oauth/fortytwo';
import { errorHandler } from '../../../utils/error';

export async function GET(request: Request): Promise<Response> {
	return errorHandler(async () => {
		const url = new URL(request.url);
		const code = url.searchParams.get('code');
		const clientType = url.searchParams.get('state');
		if (code === null) {
			return Response.redirect(new URL('/', request.url).toString(), 302);
		}

		const authorization = await getFortyTwoOauthToken(code);
		const me = await getFortyTwoMe(authorization.access_token);
		const user = await createOrUpdateFortyTwoUser(me, authorization);

		const session = await createSession({ user_id: user.id });
		const { cookie: csrfCookie } = createCsrfCookie();

		const clientUrl = (
			(clientType === 'mobile' ? process.env.CLIENT_URL_MOBILE : undefined) ??
			process.env.CLIENT_URL_WEB ??
			process.env.CLIENT_URL ??
			'http://localhost:8081'
		)
			.replace(/[\x00-\x1F\x7F]/g, '')
			.trim();

		const redirectUrl = `${clientUrl}/oauth-callback?token=${encodeURIComponent(session.body)}`;

		const headers = new Headers();
		headers.append('Location', redirectUrl);
		headers.append('Set-Cookie', csrfCookie);
		headers.append(
			'Set-Cookie',
			`token=${session.body}; HttpOnly; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax`
		);

		return new Response(
			JSON.stringify({
				success: true,
				token: session.body,
				user: { id: user.id, email: user.email, username: user.username },
			}),
			{
				status: 302,
				headers,
			}
		);
	});
}
