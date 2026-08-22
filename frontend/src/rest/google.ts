import { RelativePathString } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

const AUTHORIZATION_GOOGLE_BASE_URL = 'https://accounts.google.com';

export function generateGoogleAuthorizationUrl(): RelativePathString {
	const url: URL = new URL(`${AUTHORIZATION_GOOGLE_BASE_URL}/o/oauth2/v2/auth`);

	if (process.env.EXPO_PUBLIC_OAUTH_GOOGLE_CLIENTID === undefined)
		throw new Error('Missing key EXPO_PUBLIC_OAUTH_GOOGLE_CLIENTID in environement');

	const baseUrl = process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:3000';

	url.searchParams.set('client_id', process.env.EXPO_PUBLIC_OAUTH_GOOGLE_CLIENTID);
	url.searchParams.set('scope', 'openid email profile');
	url.searchParams.set('redirect_uri', `${baseUrl}/api/auth/oauth/oauth_google`);
	url.searchParams.set('response_type', 'code');

	return url.toString() as RelativePathString;
}

export async function performGoogleOAuth(): Promise<string | null> {
	const authUrl = generateGoogleAuthorizationUrl();

	if (Platform.OS === 'web') {
		return new Promise((resolve) => {
			const popup = window.open(authUrl, 'oauth', 'width=500,height=700');

			const listener = (event: MessageEvent) => {
				if (event.origin !== window.location.origin) return;
				if (event.data?.type === 'oauth-success') {
					window.removeEventListener('message', listener);
					resolve(event.data.token);
				}
			};

			window.addEventListener('message', listener);

			const checkClosed = setInterval(() => {
				if (popup?.closed) {
					clearInterval(checkClosed);
					window.removeEventListener('message', listener);
					resolve(null);
				}
			}, 500);
		});
	}

	const redirectUrl = Linking.createURL('oauth-callback');
	const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

	if (result.type === 'success' && result.url) {
		const parsed = Linking.parse(result.url);
		return (parsed.queryParams?.token as string) ?? null;
	}

	return null;
}
