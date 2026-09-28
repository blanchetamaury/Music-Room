import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { unwrapApiResponse, unwrapApiResponseVoid } from './helpers';

export function useLoginMutation() {
	return useMutation({
		mutationFn: ({ email, password }: { email: string; password: string }) =>
			api.auth.login(email, password).then(unwrapApiResponse),
	});
}

export function useSignupMutation() {
	return useMutation({
		mutationFn: ({ email, password, username }: { email: string; password: string; username: string }) =>
			api.auth.signup(email, password, username).then(unwrapApiResponseVoid),
	});
}

export function useLogoutMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (token: string) => api.auth.logout(token).then(unwrapApiResponseVoid),
		onSuccess: () => {
			queryClient.clear();
		},
	});
}

export function useConfirmEmailMutation() {
	return useMutation({
		mutationFn: (token: string) => api.auth.confirmEmail(token).then(unwrapApiResponseVoid),
	});
}

export function useResendVerificationMutation() {
	return useMutation({
		mutationFn: (mail: string) => api.auth.resendVerification(mail).then(unwrapApiResponseVoid),
	});
}

export function useResetPasswordRequestMutation() {
	return useMutation({
		mutationFn: (email: string) => api.auth.resetPassword.request(email).then(unwrapApiResponseVoid),
	});
}

export function useResetPasswordVerifyMutation() {
	return useMutation({
		mutationFn: ({ email, code, password }: { email: string; code: string; password: string }) =>
			api.auth.resetPassword.verify(email, code, password).then(unwrapApiResponseVoid),
	});
}
