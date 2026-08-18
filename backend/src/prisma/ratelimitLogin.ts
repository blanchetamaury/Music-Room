import { Prisma } from "./generated/client";
import { prisma } from "./prisma";

const createRateLimitLogin = async (
	user_id: string,
	ip: string,
	success: boolean
): Promise<Prisma.ratelimit_loginGetPayload<Prisma.ratelimit_loginDefaultArgs>> => {
	return prisma.ratelimit_login.create({
		data: {
			user_id: user_id,
			ip: ip,
			success: success,
		},
	});
};

const countRateLimitLoginByUserId = async (user_id: string, success: boolean, windowMs: number): Promise<number> => {
	const since = new Date(Date.now() - windowMs);
	return prisma.ratelimit_login.count({
		where: {
			user_id: user_id,
			success: success,
			created_at: { gte: since },
		},
	});
};

const countRateLimitLoginByIp = async (ip: string, success: boolean, windowMs: number): Promise<number> => {
	const since = new Date(Date.now() - windowMs);
	return prisma.ratelimit_login.count({
		where: {
			ip: ip,
			success: success,
			created_at: { gte: since },
		},
	});
};

export { createRateLimitLogin, countRateLimitLoginByUserId, countRateLimitLoginByIp };