import { z } from 'zod';
import { ERRORS_DETAILS } from './error';

async function parseBody<T>(req: Request, schema: z.ZodSchema): Promise<T> {
	const content_type = req.headers.get('content-type')?.toLowerCase() || 'text/plain';

	let body: object;

	switch (content_type) {
		case 'application/json':
			try {
				body = await req.json();
			} catch {
				throw ERRORS_DETAILS.invalid_body();
			}
			break;
		default:
			throw ERRORS_DETAILS.unsupported_content_type();
	}
	const data = schema.safeParse(body);
	if (!data.success) {
		const error = data.error.issues[0];
		const field = error.path[error.path.length - 1].toString();

		if (error.code === 'invalid_type') throw ERRORS_DETAILS.missing_parameter(field);
		throw ERRORS_DETAILS.invalid_parameter(field);
	}

	return data.data as T;
}

const parseParams = <T>(param: URLSearchParams, schema: z.ZodObject): T => {
	const fields = Object.keys(schema.shape);

	let tab: object = {};
	for (const field of fields) {
		tab = { ...tab, ...Object({ [field]: param.get(field) }) };
	}

	const data = schema.safeParse(tab);

	if (!data.success) {
		const error = data.error.issues[0];
		const field = error.path[error.path.length - 1].toString();

		if (error.code === 'invalid_type') throw ERRORS_DETAILS.missing_parameter(field);
		throw ERRORS_DETAILS.invalid_parameter(field);
	}

	return tab as T;
};

export { parseBody, parseParams };