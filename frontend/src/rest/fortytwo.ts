import { openAuthorizationFlow, startOAuth } from './oauth';

export type { OAuthProviderKey } from './oauth';

export async function performFortyTwoOAuth(token?: string): Promise<string | null> {
	const authUrl = await startOAuth('fortytwo', { token });
	return openAuthorizationFlow(authUrl);
}
