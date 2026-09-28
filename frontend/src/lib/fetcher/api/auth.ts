import { fetchApi } from './client';
import { LoginResult } from '@/src/types/auth/SessionExchange';

export const auth = {
	login: (email: string, password: string) =>
		fetchApi<LoginResult>('/auth/login', {
			method: 'POST',
			body: JSON.stringify({ mail: email, password }),
		}),

	signup: (email: string, password: string, username: string) =>
		fetchApi<void>('/auth/signup', {
			method: 'POST',
			body: JSON.stringify({ mail: email, password, username }),
		}),

	logout: (token: string) =>
		fetchApi<void>('/auth/logout', {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
		}),

	resetPassword: {
		request: (email: string) =>
			fetchApi<void>('/auth/reset-password/request', {
				method: 'POST',
				body: JSON.stringify({ mail: email }),
			}),

		verify: (email: string, code: string, password: string) =>
			fetchApi<void>('/auth/reset-password/verify', {
				method: 'POST',
				body: JSON.stringify({ mail: email, code, password }),
			}),
	},
};
