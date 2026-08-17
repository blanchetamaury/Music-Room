import { createCsrfCookie } from '../../lib/csrf';
import { createAndSetSession } from '../../lib/session';
import { SignUpParametersSchema } from '../../schema/SignUpParametersSchema';
import { createUser, existUserByMail } from '../../prisma/user';
import { errorHandler, ERRORS_DETAILS } from '../../utils/error';
import { parseBody } from '../../utils/parsing';
import { SignUpParameters } from '../../types/auth/SignUpParameters';

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const body = await parseBody<SignUpParameters>(req, SignUpParametersSchema);
		let user;

		if (await existUserByMail(body.mail)) throw ERRORS_DETAILS.already_exist();

		else user = await createUser(body.mail, body.password, body.username);

		const sessionCookie = await createAndSetSession({
			user_id: user.id,
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