import { FortyTwoCursusUserDetails } from '@/types/fortytwo/FortyTwoCursusUserDetails';
import { FortyTwoOauthToken } from '@/types/fortytwo/FortyTwoOauthToken';
import { ERRORS_DETAILS } from '@/utils/error';

const FORTY_TWO_BASE_URL = 'https://api.intra.42.fr';

export function generateFortyTwoAuthorizationUrl(): string {
	const url: URL = new URL(`${FORTY_TWO_BASE_URL}/oauth/authorize`);

	if (process.env.NEXT_PUBLIC_OAUTH_42_CLIENTID === undefined)
		throw new Error('Missing key NEXT_PUBLIC_OAUTH_42_CLIENTID in environement');

	url.searchParams.set('client_id', process.env.NEXT_PUBLIC_OAUTH_42_CLIENTID);
	url.searchParams.set(
		'redirect_uri',
		`https://${process.env.NEXT_PUBLIC_BASE_URL}/app/api/auth/oauth/fortytwo/authorize`
	);
	url.searchParams.set('response_type', 'code');

	return url.toString();
}

export async function getFortyTwoOauthToken(code: string): Promise<FortyTwoOauthToken> {
	const authorize_fetch: Response = await fetch(`${FORTY_TWO_BASE_URL}/oauth/token`, {
		method: 'POST',
		body: JSON.stringify({
			grant_type: 'authorization_code',
			client_id: process.env.NEXT_PUBLIC_OAUTH_42_CLIENTID,
			client_secret: process.env.OAUTH_42_SECRET,
			code: code,
			redirect_uri: `https://${process.env.NEXT_PUBLIC_BASE_URL}/app/api/auth/oauth/fortytwo/authorize`,
		}),
		headers: {
			'Content-Type': 'application/json',
		},
	});
	if (authorize_fetch.status === 401) throw ERRORS_DETAILS.invalid_oauth_error();
	if (!authorize_fetch.ok) throw new Error(`42 API repond with status code ${authorize_fetch.status}`);
	return await authorize_fetch.json();
}

export async function getFortyTwoMe(token: string): Promise<FortyTwoCursusUserDetails> {
	const me_fetch: Response = await fetch(`${FORTY_TWO_BASE_URL}/v2/me`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	if (!me_fetch.ok) throw new Error(`42 API repond with status code ${me_fetch.status}`);

	return await me_fetch.json();
}