import { getUserFromToken } from '../utils/token';
import { ERRORS_DETAILS } from '../utils/error';
import { prisma } from '../../prisma/database/prisma';
import { readRow } from './permissions';

export const isEmailVerified = async (userId: string): Promise<boolean> => {
	const user = await readRow(() =>
		prisma.user.findUnique({ where: { id: userId }, select: { emailVerified: true } })
	);
	return user?.emailVerified === true;
};

export const requireVerifiedEmail = async (req: Request): Promise<string> => {
	const userId = await getUserFromToken(req);
	if (!userId) throw ERRORS_DETAILS.session_expired();
	if (!(await isEmailVerified(userId))) throw ERRORS_DETAILS.email_verification_required();
	return userId;
};

export const requireUser = async (req: Request): Promise<string> => {
	const userId = await getUserFromToken(req);
	if (!userId) throw ERRORS_DETAILS.session_expired();
	return userId;
};
