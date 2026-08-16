import { createAndSetSession } from '@/lib/session';
import { parseBody } from '@/utils/parsing';
import { createCsrfCookie } from '@/lib/csrf';
import { errorHandler, ERRORS_DETAILS } from '@/utils/error';
import { SignUpParameters } from '@/types/auth/SignUpParameters';
import { SignUpParametersSchema } from '@/schema/SignUpParametersSchema';
import { createUser, existUserByMail } from '@/prisma/user';

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const body = await parseBody<SignUpParameters>(req, SignUpParametersSchema);
		let user;

		if (await existUserByMail(body.mail)) throw ERRORS_DETAILS.already_exists('Ce compte');

		else user = await createUser(body.mail, body.password, body.username);

		await createAndSetSession({
			user_id: user.id,
		});

		createCsrfCookie();

		return Response.json({ success: true });
	});
}