import { errorHandler, ERRORS_DETAILS } from '../../../utils/error';
import { parseBody } from '../../../utils/parsing';
import { SessionExchangeSchema } from '../../../schema/SessionSchema';
import { consumeSessionExchange, deleteExpiredSessionExchanges } from '../../../../prisma/database/sessionExchange';
import { createSession } from '../../../lib/session';
import { getUserById } from '../../../../prisma/database/user';
import { z } from 'zod';

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const body = await parseBody<z.infer<typeof SessionExchangeSchema>>(req, SessionExchangeSchema);

		await deleteExpiredSessionExchanges();

		const exchange = await consumeSessionExchange(body.code);

		if (!exchange) throw ERRORS_DETAILS.invalid_token();

		const user = await getUserById(exchange.userId, {});

		if (!user) throw ERRORS_DETAILS.session_expired();

		const session = await createSession({ user_id: user.id });

		return Response.json(
			{
				success: true,
				data: {
					token: session.body,
					expiresIn: 2 * 60 * 60,
					user: {
						id: user.id,
						email: user.email,
						username: user.username,
						avatarUrl: user.avatarUrl,
						emailVerified: user.emailVerified,
					},
				},
			},
			{ status: 200 }
		);
	});
}
