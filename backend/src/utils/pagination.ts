import { PaginationParameters } from '@/types/pagination/PaginationParameters';
import { PaginationResponse } from '@/types/pagination/PaginationResponse';

const DEFAULT_PAGINATION = { page: 1, limit: 20 };

const getPaginationParams = (params: URLSearchParams): PaginationParameters => {
	const pagination: PaginationParameters = DEFAULT_PAGINATION;

	if (params.has('limit')) {
		const limit = Number(params.get('limit')!);

		if (!isNaN(limit) && limit >= 1 && limit <= 100) {
			pagination.limit = limit;
		}
	}

	if (params.has('page')) {
		const page = Number(params.get('page')!);

		if (!isNaN(page) && page >= 1) {
			pagination.page = page;
		}
	}

	return pagination;
};

const paginationToPrisma = (pagination: PaginationParameters): { take: number; skip: number } => {
	return {
		take: pagination.limit,
		skip: pagination.limit * (pagination.page - 1),
	};
};

const generatePaginationResponse = <T>(
	data: T[],
	total: number,
	pagination: PaginationParameters
): PaginationResponse<T> => {
	return {
		data,
		page: pagination.page,
		page_size: pagination.limit,
		total_pages: Math.max(1, Math.ceil(total / pagination.limit)),
	};
};

export { DEFAULT_PAGINATION, getPaginationParams, paginationToPrisma, generatePaginationResponse };
