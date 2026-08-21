import { createOrUpdateFortyTwoUser } from '../../../../prisma/database/user';
import { createCsrfCookie } from '../../../lib/csrf';
import { createSession } from '../../../lib/session';
import { getFortyTwoMe, getFortyTwoOauthToken } from '../../../oauth/fortytwo';
import { errorHandler } from '../../../utils/error';

export async function GET(request: Request): Promise<Response> {
    return errorHandler(async () => {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');
        if (code === null) {
            return Response.redirect(new URL('/', request.url).toString(), 302);
        }

        const authorization = await getFortyTwoOauthToken(code);
        const me = await getFortyTwoMe(authorization.access_token);
        const user = await createOrUpdateFortyTwoUser(me, authorization);

        const session = await createSession({
            user_id: user.id
        });

        const { cookie: csrfCookie } = createCsrfCookie();

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:8081';
        
        const headers = new Headers();
        headers.append('Location', `${clientUrl}/(tabs)/home`);
        headers.append('Set-Cookie', csrfCookie);
        headers.append(
            'Set-Cookie',
            `token=${session.body}; HttpOnly; Path=/; Max-Age=${2 * 60 * 60}; SameSite=Lax`
        );
        headers.append('Content-Type', 'application/json');

        return new Response(
            JSON.stringify({
                success: true,
                token: session.body,
                user: { id: user.id, email: user.email, username: user.username },
            }),
            {
                status: 200,
                headers,
            }
        );
    });
}