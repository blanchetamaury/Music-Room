import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { unwrapApiResponse, unwrapApiResponseVoid } from './helpers';
import type { DeviceDelegation } from '@/src/types/device/Device';

export const deviceQueryKeys = {
	all: ['device'] as const,
	devices: (token: string) => ['device', 'list', token] as const,
};

export function useDevicesQuery(token: string | null) {
	return useQuery({
		queryKey: deviceQueryKeys.devices(token ?? ''),
		queryFn: () => api.user.device.devices(token ?? '').then(unwrapApiResponse),
		enabled: Boolean(token),
	});
}

export function useRegisterDeviceMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			token,
			deviceName,
			platform,
			appVersion,
		}: {
			token: string;
			deviceName: string;
			platform: 'ios' | 'android' | 'web';
			appVersion: string;
		}) => api.user.device.register(token, { deviceName, platform, appVersion }).then(unwrapApiResponse),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: deviceQueryKeys.devices(variables.token) });
		},
	});
}

export function useRevokeDeviceMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ token, deviceId }: { token: string; deviceId: string }) =>
			api.user.device.revoke(token, deviceId).then(unwrapApiResponseVoid),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: deviceQueryKeys.devices(variables.token) });
		},
	});
}

export function useDelegateDeviceMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ token, ...delegation }: { token: string } & DeviceDelegation) =>
			api.user.device.delegate(token, delegation).then(unwrapApiResponse),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: deviceQueryKeys.devices(variables.token) });
		},
	});
}

export function useRevokeDeviceDelegationMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			token,
			deviceId,
			delegateUserId,
		}: {
			token: string;
			deviceId: string;
			delegateUserId: string;
		}) => api.user.device.revokeDelegation(token, deviceId, delegateUserId).then(unwrapApiResponseVoid),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: deviceQueryKeys.devices(variables.token) });
		},
	});
}
