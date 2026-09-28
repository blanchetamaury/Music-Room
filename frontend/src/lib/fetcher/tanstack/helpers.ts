import { ApiResponse } from '@/src/types/api/ApiResponse';

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
	if (!response.success) {
		throw new Error(response.message ?? 'API request failed');
	}

	if (response.data === undefined) {
		throw new Error(response.message ?? 'API request failed');
	}

	return response.data;
}

export function unwrapApiResponseVoid<T>(response: ApiResponse<T>): void {
	if (!response.success) {
		throw new Error(response.message ?? 'API request failed');
	}
}
