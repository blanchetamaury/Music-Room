import { ApiResponse } from '@/src/types/api/ApiResponse';

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
	if (!response.success || response.data === undefined) {
		throw new Error(response.message ?? 'API request failed');
	}

	return response.data;
}
