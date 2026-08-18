import { GoogleOauthResponse } from '@/src/types/google/GoogleOauthResponse';
import { GoogleOauthToken } from '@/src/types/google/GoogleOauthToken';
import { RelativePathString } from 'expo-router';
import { ERRORS_DETAILS } from '../utils/error';

const AUTHORIZATION_GOOGLE_BASE_URL = 'https://accounts.google.com';
const TOKEN_GOOGLE_BASE_URL = 'https://oauth2.googleapis.com';

export function generateGoogleAuthorizationUrl(): RelativePathString {
	const url: URL = new URL(`${AUTHORIZATION_GOOGLE_BASE_URL}/o/oauth2/v2/auth`);

	if (process.env.EXPO_PUBLIC_OAUTH_GOOGLE_CLIENTID === undefined)
		throw new Error('Missing key EXPO_PUBLIC_OAUTH_GOOGLE_CLIENTID in environement');

	const baseUrl = process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:3000';
	
	url.searchParams.set('client_id', process.env.EXPO_PUBLIC_OAUTH_GOOGLE_CLIENTID);
	url.searchParams.set('scope', 'openid email profile');
	url.searchParams.set(
		'redirect_uri',
		`${baseUrl}/api/auth/oauth/oauth_google`
	);
	url.searchParams.set('response_type', 'code');

	return url.toString() as RelativePathString;
}
