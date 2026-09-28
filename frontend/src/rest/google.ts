import { openAuthorizationFlow, startOAuth } from './oauth';

export type { OAuthProviderKey } from './oauth';

export async function performGoogleOAuth(token?: string): Promise<string | null> {
	const authUrl = await startOAuth('google', { token });
	return openAuthorizationFlow(authUrl);
}
