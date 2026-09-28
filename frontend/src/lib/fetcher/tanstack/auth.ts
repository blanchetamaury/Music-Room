import { useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import { unwrapApiResponse } from './helpers';

export function useLoginMutation() {
	return useMutation({
		mutationFn: ({ email, password }: { email: string; password: string }) =>
			api.auth.login(email, password).then(unwrapApiResponse),
	});
}

export function useSignupMutation() {
	return useMutation({
		mutationFn: ({ email, password, username }: { email: string; password: string; username: string }) =>
			api.auth.signup(email, password, username).then(unwrapApiResponse),
	});
}

export function useLogoutMutation() {
	return useMutation({
		mutationFn: () => api.auth.logout().then(unwrapApiResponse),
	});
}

export function useConfirmMailMutation() {
	return useMutation({
		mutationFn: ({ email, code }: { email: string; code: string }) =>
			api.auth.confirmMailAccount(email, code).then(unwrapApiResponse),
	});
}

export function useResetPasswordRequestMutation() {
	return useMutation({
		mutationFn: (email: string) => api.auth.resetPassword.request(email).then(unwrapApiResponse),
	});
}

export function useResetPasswordVerifyMutation() {
	return useMutation({
		mutationFn: ({ email, code, password }: { email: string; code: string; password: string }) =>
			api.auth.resetPassword.verify(email, code, password).then(unwrapApiResponse),
	});
}
