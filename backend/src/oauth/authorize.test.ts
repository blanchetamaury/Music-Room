import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildAuthorizationUrl, getRedirectUri, isValidClientType, resolveClientRedirect } from './authorize';

const SECRET = 'unit-test-secret-that-is-definitely-long-enough';
process.env.SESSION_SECRET = SECRET;
process.env.EXPO_PUBLIC_BASE_URL = 'https://music-room.test';
process.env.EXPO_PUBLIC_OAUTH_GOOGLE_CLIENTID = 'google-client-id';
process.env.EXPO_PUBLIC_OAUTH_42_CLIENTID = 'fortytwo-client-id';
process.env.OAUTH_GOOGLE_SECRET = 'google-secret';
process.env.OAUTH_42_SECRET = 'fortytwo-secret';
process.env.CLIENT_URL_WEB = 'https://web.music-room.test';
process.env.CLIENT_URL_MOBILE = 'exp://localhost:8081';

describe('OAuth authorize URLs', () => {
	it('binds the state the server issued', () => {
		const url = new URL(buildAuthorizationUrl('google', 'state-abc'));
		assert.equal(url.searchParams.get('state'), 'state-abc');
		assert.equal(url.searchParams.get('response_type'), 'code');
		assert.equal(url.searchParams.get('client_id'), 'google-client-id');
		assert.equal(url.origin + url.pathname, 'https://accounts.google.com/o/oauth2/v2/auth');
	});

	it('uses the 42 authorize endpoint for 42', () => {
		const url = new URL(buildAuthorizationUrl('fortytwo', 'state-abc'));
		assert.equal(url.origin + url.pathname, 'https://api.intra.42.fr/oauth/authorize');
		assert.equal(url.searchParams.get('state'), 'state-abc');
	});

	it('always requests a scope, because both providers fail without one', () => {
		for (const provider of ['google', 'fortytwo'] as const) {
			const scope = new URL(buildAuthorizationUrl(provider, 's')).searchParams.get('scope');
			assert.ok(scope, `${provider} sent no scope`);
			assert.ok(scope.length > 0, `${provider} sent an empty scope`);
		}
	});

	it('asks 42 only for public data', () => {
		const scope = new URL(buildAuthorizationUrl('fortytwo', 's')).searchParams.get('scope');
		assert.equal(scope, 'public');
		assert.ok(!scope.includes('projects') && !scope.includes('friends') && !scope.includes('groups'));
	});

	it('never lets the client choose the redirect URI', () => {
		assert.equal(getRedirectUri('google'), 'https://music-room.test/api/auth/oauth/oauth_google');
		assert.equal(getRedirectUri('fortytwo'), 'https://music-room.test/api/auth/oauth/oauth_fortytwo');
	});

	it('uses the same redirect URI the token exchange will send', () => {
		const authUrl = new URL(buildAuthorizationUrl('google', 's'));
		assert.equal(authUrl.searchParams.get('redirect_uri'), getRedirectUri('google'));
	});

	it('fails loudly when a client id is missing', () => {
		const previous = process.env.EXPO_PUBLIC_OAUTH_GOOGLE_CLIENTID;
		delete process.env.EXPO_PUBLIC_OAUTH_GOOGLE_CLIENTID;
		try {
			assert.throws(() => buildAuthorizationUrl('google', 's'), /EXPO_PUBLIC_OAUTH_GOOGLE_CLIENTID/);
		} finally {
			process.env.EXPO_PUBLIC_OAUTH_GOOGLE_CLIENTID = previous;
		}
	});
});

describe('client redirect resolution', () => {
	it('routes web and mobile to different callback paths', () => {
		assert.equal(resolveClientRedirect('web'), 'https://web.music-room.test/oauth-callback');
		assert.equal(resolveClientRedirect('mobile'), 'exp://localhost:8081/--/oauth-callback');
	});

	it('refuses a non-http scheme so a misconfiguration cannot become an open redirect', () => {
		process.env.CLIENT_URL_WEB = 'javascript:alert(1)';
		try {
			assert.throws(() => resolveClientRedirect('web'), /CLIENT_URL/);
		} finally {
			process.env.CLIENT_URL_WEB = 'https://web.music-room.test';
		}
	});

	it('accepts only known client types', () => {
		assert.equal(isValidClientType('web'), true);
		assert.equal(isValidClientType('mobile'), true);
		assert.equal(isValidClientType('desktop'), false);
		assert.equal(isValidClientType(''), false);
	});
});
