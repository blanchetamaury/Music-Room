import { randomBytes } from 'crypto';
import * as SecureStore from 'expo-secure-store';

const CSRF_COOKIE_NAME = 'csrf_token';

export function generateCsrfToken(): string {
	return randomBytes(32).toString('hex');
}

export async function setCsrfToken(): Promise<string> {
    const token = generateCsrfToken();
    await SecureStore.setItemAsync(CSRF_COOKIE_NAME, token);
    return token;
}

export async function getCsrfToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(CSRF_COOKIE_NAME);
}

export async function verifyCsrf(req: Request): Promise<boolean> {
	const cookieToken = await getCsrfToken();
	const headerToken = req.headers.get('x-csrf-token');

	if (!cookieToken || !headerToken) return false;
	if (cookieToken !== headerToken) return false;

	return true;
}