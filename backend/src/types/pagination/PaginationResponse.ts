export interface PaginationResponse<T> {
	data: T[];
	page: number;
	page_size: number;
	total_pages: number;
}
