import { createOrUpdateGoogleUser } from '../../../../prisma/database/user';
import { createCsrfCookie } from '../../../lib/csrf';
import { createSession } from '../../../lib/session';
import { getGoogleMe, getGoogleOauthToken } from '../../../oauth/google';
import { errorHandler } from '../../../utils/error';

export async function GET(request: Request): Promise<Response> {
	return errorHandler(async () => {
		const url = new URL(request.url);
		const code = url.searchParams.get('code');
		if (code === null) {
			return Response.redirect(new URL('/', request.url).toString(), 302);
		}

		const authorization = await getGoogleOauthToken(code);
		const me = await getGoogleMe(authorization.access_token);
		const user = await createOrUpdateGoogleUser(me, authorization);

		const session = await createSession({ user_id: user.id });
		const { cookie: csrfCookie } = createCsrfCookie();

		const clientUrl = process.env.CLIENT_URL || 'http://localhost:8081';

		const redirectUrl = `${clientUrl}/oauth-callback?token=${encodeURIComponent(session.body)}`;

		const headers = new Headers();
		headers.append('Location', redirectUrl);
		headers.append('Set-Cookie', csrfCookie);
		headers.append('Set-Cookie', `token=${session.body}; HttpOnly; Path=/; Max-Age=${2 * 60 * 60}; SameSite=Lax`);

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
