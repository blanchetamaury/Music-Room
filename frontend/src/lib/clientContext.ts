import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { storage } from './storage';

const DEVICE_ID_KEY = 'install_device_id';

export interface ClientContext {
	platform: string;
	appVersion: string;
	deviceId: string | undefined;
	deviceModel: string | undefined;
}


const context: ClientContext = {
	platform: Platform.OS,
	appVersion: Constants.expoConfig?.version ?? 'unknown',
	deviceId: undefined,
	deviceModel: undefined,
};

const resolveDeviceModel = (): string => {
	if (Platform.OS === 'web') {
		if (typeof navigator === 'undefined') return 'web';
		return navigator.userAgent.slice(0, 120) || 'web';
	}
	return Platform.OS;
};

const resolveDeviceId = (): string => {
	const webCrypto = typeof globalThis.crypto !== 'undefined' ? globalThis.crypto : undefined;
	if (webCrypto && typeof webCrypto.randomUUID === 'function') return webCrypto.randomUUID();
	return `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export const initClientContext = async (): Promise<ClientContext> => {
	if (context.deviceModel === undefined) context.deviceModel = resolveDeviceModel();
	if (context.deviceId === undefined) {
		const stored = await storage.getItem(DEVICE_ID_KEY);
		context.deviceId = stored ?? resolveDeviceId();
		if (!stored) await storage.setItem(DEVICE_ID_KEY, context.deviceId);
	}
	return context;
};

export const getClientContext = (): ClientContext => context;

export const clientAuditHeaders = (): Record<string, string> => {
	const headers: Record<string, string> = {
		'X-Client-Platform': context.platform,
		'X-App-Version': context.appVersion,
	};
	if (context.deviceId) headers['X-Device-Id'] = context.deviceId;
	if (context.deviceModel) headers['X-Device-Model'] = context.deviceModel;
	return headers;
};
