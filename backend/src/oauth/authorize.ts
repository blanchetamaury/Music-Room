export type OAuthProviderKey = 'google' | 'fortytwo';
export type OAuthClientType = 'web' | 'mobile';

export const getServerBaseUrl = (): string =>
	(process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');

const REDIRECT_PATHS: Record<OAuthProviderKey, string> = {
	google: '/api/auth/oauth/oauth_google',
	fortytwo: '/api/auth/oauth/oauth_fortytwo',
};

export const getRedirectUri = (provider: OAuthProviderKey): string =>
	`${getServerBaseUrl()}${REDIRECT_PATHS[provider]}`;

const getClientId = (provider: OAuthProviderKey): string => {
	if (provider === 'google') {
		const id = process.env.EXPO_PUBLIC_OAUTH_GOOGLE_CLIENTID;
		if (!id) throw new Error('Missing key EXPO_PUBLIC_OAUTH_GOOGLE_CLIENTID in environement');
		return id;
	}
	const id = process.env.EXPO_PUBLIC_OAUTH_42_CLIENTID;
	if (!id) throw new Error('Missing key EXPO_PUBLIC_OAUTH_42_CLIENTID in environement');
	return id;
};

export const getProviderSecret = (provider: OAuthProviderKey): string => {
	if (provider === 'google') {
		const secret = process.env.OAUTH_GOOGLE_SECRET;
		if (!secret) throw new Error('Missing key OAUTH_GOOGLE_SECRET in environement');
		return secret;
	}
	const secret = process.env.OAUTH_42_SECRET;
	if (!secret) throw new Error('Missing key OAUTH_42_SECRET in environement');
	return secret;
};

export const buildAuthorizationUrl = (provider: OAuthProviderKey, state: string): string => {
	const params = new URLSearchParams({
		client_id: getClientId(provider),
		redirect_uri: getRedirectUri(provider),
		response_type: 'code',
		state,
	});

	if (provider === 'google') {
		params.set('scope', 'openid email profile');
		return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
	}

	params.set('scope', 'public');
	return `https://api.intra.42.fr/oauth/authorize?${params.toString()}`;
};

export const resolveClientRedirect = (clientType: string, code?: string): string => {
	const configured =
		clientType === 'mobile'
			? (process.env.CLIENT_URL_MOBILE ?? process.env.CLIENT_URL)
			: (process.env.CLIENT_URL_WEB ?? process.env.CLIENT_URL);

	const raw = (configured ?? 'http://localhost:8081').replace(/[\x00-\x1F\x7F]/g, '').trim();

	let parsed: URL;
	try {
		parsed = new URL(raw);
	} catch {
		throw new Error('CLIENT_URL_* must be an absolute URL');
	}

	if (!['http:', 'https:', 'exp:'].includes(parsed.protocol)) {
		throw new Error('CLIENT_URL_* must be an http(s) or exp: URL');
	}

	const callbackPath = clientType === 'mobile' ? '/--/oauth-callback' : '/oauth-callback';
	const base = `${parsed.origin === 'null' ? `${parsed.protocol}//${parsed.host}` : parsed.origin}${
		parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/+$/, '')
	}`;

	const redirect = new URL(`${base}${callbackPath}`);
	if (code) redirect.searchParams.set('code', code);
	return redirect.toString();
};

export const isValidClientType = (value: string): value is OAuthClientType => value === 'web' || value === 'mobile';
