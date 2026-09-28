const isPrismaKnownError = (error: unknown): error is { code: string; meta?: unknown } => {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		typeof (error as { code: unknown }).code === 'string'
	);
};

const hasPrismaCode = (error: unknown, ...codes: string[]): boolean => {
	return isPrismaKnownError(error) && codes.includes(error.code);
};

const isRecordNotFound = (error: unknown): boolean => hasPrismaCode(error, 'P2025');

const isUniqueViolation = (error: unknown): boolean => hasPrismaCode(error, 'P2002');

const isForeignKeyViolation = (error: unknown): boolean => hasPrismaCode(error, 'P2003');

const isWriteConflict = (error: unknown): boolean => hasPrismaCode(error, 'P2034', 'P2028', 'P2039');

const isConcurrencyConflict = (error: unknown): boolean => isUniqueViolation(error) || isWriteConflict(error);

export {
	hasPrismaCode,
	isConcurrencyConflict,
	isForeignKeyViolation,
	isPrismaKnownError,
	isRecordNotFound,
	isUniqueViolation,
	isWriteConflict,
};
