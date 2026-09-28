import { Prisma } from '../generated/client';
import { prisma } from './prisma';
import { createHash } from 'crypto';

const generateCodeHash = (code: string): string => {
	return createHash('sha256').update(code).digest('hex');
};

const createCode = async (
	mail: string,
	codeHash: string,
	expiresAt: Date
): Promise<Prisma.ResetPasswordGetPayload<Prisma.ResetPasswordDefaultArgs>> => {
	return prisma.resetPassword.create({
		data: {
			mail: mail,
			codeHash: codeHash,
			expiresAt: expiresAt,
		},
	});
};

const getCodeByMail = async (
	mail: string
): Promise<Prisma.ResetPasswordGetPayload<Prisma.ResetPasswordDefaultArgs> | null> => {
	return prisma.resetPassword.findFirst({
		where: {
			mail: mail,
			expiresAt: { gt: new Date() },
			usedAt: null,
		},
		orderBy: { createdAt: 'desc' },
	});
};

const markCodeAsUsed = async (id: string): Promise<Prisma.ResetPasswordGetPayload<Prisma.ResetPasswordDefaultArgs>> => {
	return prisma.resetPassword.update({
		where: { id },
		data: { usedAt: new Date() },
	});
};

const deleteExpiredCodes = async (): Promise<void> => {
	await prisma.resetPassword.deleteMany({
		where: {
			OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }],
		},
	});
};

export { createCode, getCodeByMail, markCodeAsUsed, deleteExpiredCodes, generateCodeHash };
