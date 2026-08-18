import { getGoogleMe, getGoogleOauthToken } from '../../../../../frontend/src/rest/google';
import { createCsrfCookie } from '../../../lib/csrf';
import { createSession } from '../../../lib/session';
import { createOrUpdateGoogleUser } from '../../../prisma/user';
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

        const session = await createSession({
            user_id: user.id
        });

        const { cookie: csrfCookie } = createCsrfCookie();
        const sessionCookie = `session=${session.body}; HttpOnly; Path=/; Max-Age=${2 * 60 * 60}; SameSite=Lax`;

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:8081';
        
        const headers = new Headers();
        headers.append('Location', `${clientUrl}/(tabs)/home`);
        headers.append('Set-Cookie', sessionCookie);
        headers.append('Set-Cookie', csrfCookie);

        return new Response(null, {
            status: 302,
            headers,
        });
    });
}