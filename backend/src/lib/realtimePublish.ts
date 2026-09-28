import { publish } from './realtime';

export const publishPlaylistChange = (
	playlistId: string,
	operation: string,
	actorId?: string,
	version?: number
): void => {
	publish({ topic: 'playlist', entityId: playlistId, operation, actorId, version });
};

export const publishEventChange = (eventId: string, operation: string, actorId?: string, version?: number): void => {
	publish({ topic: 'event', entityId: eventId, operation, actorId, version });
};

export const publishDeviceChange = (deviceId: string, operation: string, actorId?: string): void => {
	publish({ topic: 'device', entityId: deviceId, operation, actorId });
};
