import { createUser, existUserByMail } from '../../../prisma/database/user';
import { createCsrfCookie } from '../../lib/csrf';
import { createSession } from '../../lib/session';
import { SignUpParametersSchema } from '../../schema/SignUpParametersSchema';
import { SignUpParameters } from '../../types/auth/SignUpParameters';
import { errorHandler, ERRORS_DETAILS } from '../../utils/error';
import { parseBody } from '../../utils/parsing';

export async function POST(req: Request): Promise<Response> {
    return errorHandler(async () => {
        const body = await parseBody<SignUpParameters>(req, SignUpParametersSchema);
        let user;

        if (await existUserByMail(body.mail)) throw ERRORS_DETAILS.already_exist();

        else user = await createUser(body.mail, body.password, body.username);

        const session = await createSession({
            user_id: user.id,
        });

        const { cookie: csrfCookie } = createCsrfCookie();

        const headers = new Headers();
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