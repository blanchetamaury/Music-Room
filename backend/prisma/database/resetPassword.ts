import { Prisma } from '../generated/client';
import { prisma } from './prisma';

const createCode = async (
	mail: string,
	code: string
): Promise<Prisma.ResetPasswordGetPayload<Prisma.ResetPasswordDefaultArgs>> => {
	return prisma.resetPassword.create({
		data: {
			mail: mail,
			code: code,
		},
	});
};

const getCode = async (
	mail: string,
	code: string
): Promise<Prisma.ResetPasswordGetPayload<Prisma.ResetPasswordDefaultArgs> | null> => {
	return prisma.resetPassword.findUnique({
		where: {
			mail_code: {
				mail: mail,
				code: code,
			},
		},
	});
};

export { createCode, getCode };
