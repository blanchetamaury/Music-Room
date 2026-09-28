import { createSessionExchange } from '../../../../prisma/database/sessionExchange';
import {
	consumeOAuthState,
	deleteExpiredOAuthStates,
	type OAuthProviderName,
} from '../../../../prisma/database/oauthState';
import { createCsrfCookie } from '../../../lib/csrf';
import { createSession, SESSION_MAX_AGE_SECONDS } from '../../../lib/session';
import { resolveClientRedirect } from '../../../oauth/authorize';
import { ERRORS_DETAILS } from '../../../utils/error';

export interface OAuthCallbackSuccess {
	user: { id: string; email: string };
	linked: boolean;
}

export interface ConsumedState {
	clientType: string;
	linkUserId: string | null;
}

export const completeOAuthCallback = async (
	req: Request,
	provider: OAuthProviderName,
	code: string,
	exchange: (code: string, state: ConsumedState) => Promise<OAuthCallbackSuccess>
): Promise<Response> => {
	void deleteExpiredOAuthStates();

	const url = new URL(req.url);
	const state = url.searchParams.get('state');

	if (!state) return ERRORS_DETAILS.invalid_oauth_state();

	const consumed = await consumeOAuthState(state);
	if (!consumed) return ERRORS_DETAILS.invalid_oauth_state();

	if (consumed.provider !== provider) {
		return Response.json(
			{ success: false, message: 'OAuth state was issued for a different provider' },
			{ status: 400 }
		);
	}

	const { user, linked } = await exchange(code, {
		clientType: consumed.clientType,
		linkUserId: consumed.linkUserId,
	});

	if (linked) {
		return Response.json(
			{ success: true, data: { linked: true, provider: provider.toLowerCase() } },
			{ status: 200 }
		);
	}

	const session = await createSession({ user_id: user.id });
	const sessionExchange = await createSessionExchange(user.id, consumed.clientType);

	const { cookie: csrfCookie } = createCsrfCookie();
	const redirectUrl = resolveClientRedirect(consumed.clientType, sessionExchange.code);

	const headers = new Headers();
	headers.append('Location', redirectUrl);
	headers.append('Set-Cookie', csrfCookie);
	headers.append(
		'Set-Cookie',
		`token=${session.body}; HttpOnly; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax`
	);

	return new Response(null, { status: 302, headers });
};
