import { Prisma } from '../generated/client';
import { prisma } from './prisma';

const createAuditLog = async (data: {
	userId?: string;
	action: string;
	resourceType?: string;
	resourceId?: string;
	platform?: string;
	deviceId?: string;
	deviceModel?: string;
	appVersion?: string;
	ip?: string;
	success: boolean;
	statusCode: number;
	requestId: string;
}) => {
	return prisma.auditLog.create({ data });
};

const getAuditLogs = async (options?: {
	userId?: string;
	action?: string;
	resourceType?: string;
	resourceId?: string;
	startDate?: Date;
	endDate?: Date;
	page?: number;
	limit?: number;
}) => {
	const where: Prisma.AuditLogWhereInput = {};

	if (options?.userId) where.userId = options.userId;
	if (options?.action) where.action = options.action;
	if (options?.resourceType) where.resourceType = options.resourceType;
	if (options?.resourceId) where.resourceId = options.resourceId;
	if (options?.startDate || options?.endDate) {
		where.createdAt = {};
		if (options.startDate) where.createdAt.gte = options.startDate;
		if (options.endDate) where.createdAt.lte = options.endDate;
	}

	const page = options?.page ?? 1;
	const limit = options?.limit ?? 50;

	const [logs, total] = await Promise.all([
		prisma.auditLog.findMany({
			where,
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { createdAt: 'desc' },
		}),
		prisma.auditLog.count({ where }),
	]);

	return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export { createAuditLog, getAuditLogs };
