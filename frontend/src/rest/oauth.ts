import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { fetchApi } from '../lib/fetcher/api/client';
import type { ApiResponse } from '../types/api/ApiResponse';

export type OAuthProviderKey = 'google' | 'fortytwo';

export interface OAuthStartResult {
	authorizationUrl: string;
	link: boolean;
}

const clientType = (): 'web' | 'mobile' => (Platform.OS === 'web' ? 'web' : 'mobile');

export async function startOAuth(
	provider: OAuthProviderKey,
	options: { link?: boolean; token?: string } = {}
): Promise<string> {
	const { link = false, token } = options;

	const response: ApiResponse<OAuthStartResult> = await fetchApi<OAuthStartResult>('/auth/oauth/start', {
		method: 'POST',
		body: JSON.stringify({ provider, clientType: clientType(), link }),
		...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
	});

	if (!response.success || !response.data?.authorizationUrl) {
		throw new Error(response.message || 'Could not start the authentication');
	}

	return response.data.authorizationUrl;
}

export async function openAuthorizationFlow(authUrl: string): Promise<string | null> {
	if (Platform.OS === 'web') {
		return new Promise((resolve) => {
			const popup = window.open(authUrl, 'oauth', 'width=500,height=700');
			if (!popup) {
				resolve(null);
				return;
			}

			const listener = (event: MessageEvent) => {
				if (event.origin !== window.location.origin) return;
				if (event.data?.type === 'oauth-success') {
					window.removeEventListener('message', listener);
					clearInterval(checkClosed);
					resolve(event.data.code ?? null);
				}
			};

			window.addEventListener('message', listener);

			const checkClosed = setInterval(() => {
				if (popup.closed) {
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
		return (parsed.queryParams?.code as string) ?? null;
	}

	return null;
}
