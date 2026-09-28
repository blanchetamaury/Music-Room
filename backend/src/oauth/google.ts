import { GoogleOauthResponse } from '../types/google/GoogleOauthResponse';
import { GoogleOauthToken } from '../types/google/GoogleOauthToken';
import { ERRORS_DETAILS } from '../utils/error';
import { getProviderSecret, getRedirectUri } from './authorize';

const TOKEN_GOOGLE_BASE_URL = 'https://oauth2.googleapis.com';

export async function getGoogleOauthToken(code: string): Promise<GoogleOauthToken> {
	const body = new URLSearchParams({
		client_id: process.env.EXPO_PUBLIC_OAUTH_GOOGLE_CLIENTID!,
		client_secret: getProviderSecret('google'),
		code: code,
		grant_type: 'authorization_code',
		redirect_uri: getRedirectUri('google'),
	});

	const authorize_fetch: Response = await fetch(`${TOKEN_GOOGLE_BASE_URL}/token`, {
		method: 'POST',
		body: body.toString(),
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});

	if (authorize_fetch.status === 400 || authorize_fetch.status === 401) {
		console.error('Google token rejected the code:', await authorize_fetch.text());
		throw ERRORS_DETAILS.invalid_oauth_error();
	}

	if (!authorize_fetch.ok) {
		const errBody = await authorize_fetch.text();
		console.error('Google token error:', errBody);
		throw new Error(`Google API repond with status code ${authorize_fetch.status}`);
	}

	return await authorize_fetch.json();
}

export async function getGoogleMe(token: string): Promise<GoogleOauthResponse> {
	const me_fetch: Response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	if (!me_fetch.ok) throw new Error(`Google API repond with status code ${me_fetch.status}`);

	return await me_fetch.json();
}
