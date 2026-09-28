import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'session_token';
const CSRF_COOKIE_NAME = 'csrf_token';

export const storage = {
	async getItem(key: string): Promise<string | null> {
		if (Platform.OS === 'web') {
			return localStorage.getItem(key);
		}
		return SecureStore.getItemAsync(key);
	},

	async setItem(key: string, value: string): Promise<void> {
		if (Platform.OS === 'web') {
			localStorage.setItem(key, value);
			return;
		}
		await SecureStore.setItemAsync(key, value);
	},

	async deleteItem(key: string): Promise<void> {
		if (Platform.OS === 'web') {
			localStorage.removeItem(key);
			return;
		}
		await SecureStore.deleteItemAsync(key);
	},

	getToken(): Promise<string | null> {
		return storage.getItem(TOKEN_KEY);
	},

	setToken(token: string): Promise<void> {
		return storage.setItem(TOKEN_KEY, token);
	},

	clearToken(): Promise<void> {
		return storage.deleteItem(TOKEN_KEY);
	},
};

export { TOKEN_KEY };

export function getCsrfToken(): string | null {
	if (Platform.OS !== 'web' || typeof document === 'undefined') return null;

	const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE_NAME}=([^;]+)`));
	return match ? match[1] : null;
}
