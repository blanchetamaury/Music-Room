import { createOrUpdateFortyTwoUser, linkFortyTwoUser } from '../../../../prisma/database/user';
import { isUniqueViolation } from '@/utils/prisma';
import { getFortyTwoMe, getFortyTwoOauthToken } from '../../../oauth/fortytwo';
import { errorHandler, ERRORS_DETAILS } from '../../../utils/error';
import { completeOAuthCallback } from './callback';

export async function GET(request: Request): Promise<Response> {
	return errorHandler(async () => {
		const url = new URL(request.url);
		const code = url.searchParams.get('code');

		if (url.searchParams.get('error')) return ERRORS_DETAILS.invalid_oauth_error();
		if (code === null) return ERRORS_DETAILS.invalid_oauth_error();

		return completeOAuthCallback(request, 'FORTYTWO', code, async (authorizationCode, state) => {
			const authorization = await getFortyTwoOauthToken(authorizationCode);
			const me = await getFortyTwoMe(authorization.access_token);

			if (state.linkUserId) {
				try {
					await linkFortyTwoUser(state.linkUserId, me, authorization);
				} catch (e) {
					if (isUniqueViolation(e)) throw ERRORS_DETAILS.oauth_account_conflict();
					throw e;
				}
				return { user: { id: state.linkUserId, email: me.email }, linked: true };
			}

			const user = await createOrUpdateFortyTwoUser(me, authorization);
			return { user: { id: user.id, email: user.email }, linked: false };
		});
	});
}
