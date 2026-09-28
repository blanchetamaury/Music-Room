export type DevicePlatform = 'ios' | 'android' | 'web';
export type DevicePermissionType = 'CONTROL' | 'VIEW';

export interface DevicePermission {
	id: string;
	delegateUserId: string;
	permission: DevicePermissionType;
	expiresAt: Date | null;
	createdAt: Date;
}

export interface Device {
	id: string;
	deviceName: string;
	platform: DevicePlatform;
	appVersion: string;
	lastSeenAt: Date;
	permissions: DevicePermission[];
}

export interface DeviceDelegation {
	deviceId: string;
	delegateUserId: string;
	permission: DevicePermissionType;
	expiresAt?: Date;
}
