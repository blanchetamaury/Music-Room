const FORTY_TWO_BASE_URL = 'https://api.intra.42.fr';

export function generateFortyTwoAuthorizationUrl(): string {
	const url: URL = new URL(`${FORTY_TWO_BASE_URL}/oauth/authorize`);

	if (process.env.EXPO_PUBLIC_OAUTH_42_CLIENTID === undefined)
		throw new Error('Missing key EXPO_PUBLIC_OAUTH_42_CLIENTID in environement');

	const baseUrl = process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:3000';
	
	url.searchParams.set('client_id', process.env.EXPO_PUBLIC_OAUTH_42_CLIENTID);
	url.searchParams.set(
		'redirect_uri',
		`${baseUrl}/api/auth/oauth/oauth_fortytwo`
	);
	url.searchParams.set('response_type', 'code');

	return url.toString();
}