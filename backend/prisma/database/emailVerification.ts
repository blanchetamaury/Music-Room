import { Prisma } from '../generated/client';
import { prisma } from './prisma';
import { createHash, randomBytes } from 'crypto';

const generateToken = (): string => {
	return randomBytes(32).toString('hex');
};

const hashToken = (token: string): string => {
	return createHash('sha256').update(token).digest('hex');
};

const createVerification = async (
	userId: string,
	tokenHash: string,
	expiresAt: Date
): Promise<Prisma.EmailVerificationGetPayload<Prisma.EmailVerificationDefaultArgs>> => {
	return prisma.emailVerification.create({
		data: {
			userId: userId,
			tokenHash: tokenHash,
			expiresAt: expiresAt,
		},
	});
};

const getVerificationByToken = async (
	tokenHash: string
): Promise<Prisma.EmailVerificationGetPayload<Prisma.EmailVerificationDefaultArgs> | null> => {
	return prisma.emailVerification.findUnique({
		where: { tokenHash: tokenHash },
	});
};

const markVerificationAsUsed = async (
	id: string
): Promise<Prisma.EmailVerificationGetPayload<Prisma.EmailVerificationDefaultArgs>> => {
	return prisma.emailVerification.update({
		where: { id },
		data: { usedAt: new Date() },
	});
};

const deleteExpiredVerifications = async (): Promise<void> => {
	await prisma.emailVerification.deleteMany({
		where: {
			OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }],
		},
	});
};

export {
	createVerification,
	getVerificationByToken,
	markVerificationAsUsed,
	deleteExpiredVerifications,
	generateToken,
	hashToken,
};
