import { fetchApi } from "./client";

export const auth = {
	login: (email: string, password: string) =>
			fetchApi<{ user_id: string }>(
				'/auth/login',
				{
					method: 'POST',
					body: JSON.stringify({
						mail: email,
						password,
					}),
				},
			),

		signup: (
			email: string,
			password: string,
			username: string,
		) =>
			fetchApi<{ user_id: string }>(
				'/auth/signup',
				{
					method: 'POST',
					body: JSON.stringify({
						mail: email,
						password,
						username,
					}),
				},
			),

		logout: () =>
			fetchApi<void>('/auth/logout', {
				method: 'POST',
			}),

		confirmMailAccount: (
			email: string,
			code: string,
		) => {
			return fetchApi<{ success: boolean }>(
				'/auth/confirm',
				{
					method: 'POST',
					body: JSON.stringify({
						mail: email,
						code,
					}),
				},
			);
		},

		resetPassword: {
			request: (email: string) =>
				fetchApi<void>(
					'/auth/reset-password/request',
					{
						method: 'POST',
						body: JSON.stringify({
							mail: email,
						}),
					},
				),

			verify: (
				email: string,
				code: string,
				password: string,
			) =>
				fetchApi<void>(
					'/auth/reset-password/verify',
					{
						method: 'POST',
						body: JSON.stringify({
							mail: email,
							code,
							password,
						}),
					},
				),
		},
}
