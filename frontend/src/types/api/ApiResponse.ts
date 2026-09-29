export interface ApiResponse<T> {
	success: boolean;
	message?: string;
	data?: T;
	/**
	 * HTTP status, so a caller can tell two failures apart without matching on the message
	 * text. The player relies on this: 422 means the track has no preview at all, while 502
	 * means the provider is temporarily unavailable and a retry is worth making.
	 */
	status?: number;
}
