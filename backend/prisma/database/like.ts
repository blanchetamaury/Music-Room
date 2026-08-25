import { Prisma } from "../generated/client";
import { prisma } from "./prisma";

const findLikeUser = async <T extends Prisma.LikeInclude>(
	include: T,
	userId: string,
	trackId: string,
): Promise<Prisma.LikeGetPayload<{ include: T }> | null> => {
	return prisma.like.findUnique({
		include: include,
		where: {
			userId_trackId: {
				userId: userId,
				trackId: trackId,
			}
		},
	});
};

const findAllLikesUser = async <T extends Prisma.LikeInclude>(
	include: T,
	userId: string,
): Promise<Prisma.LikeGetPayload<{ include: T }>[]> => {
	return prisma.like.findMany({
		include: include,
		where: {
			userId: userId,
		},
	});
};

const createLikeUser = async <T extends Prisma.LikeInclude>(
	include: T,
	userId: string,
	trackId: string,
): Promise<Prisma.LikeGetPayload<{ include: T }>> => {
	return prisma.like.create({
		include: include,
		data: {
			trackId: trackId,
			userId: userId,
		}
	});
};

const deleteLikeUser = async <T extends Prisma.LikeInclude>(
	include: T,
	userId: string,
	trackId: string,
): Promise<Prisma.LikeGetPayload<{ include: T }> | null> => {
	return prisma.like.delete({
		include: include,
		where: {
			userId_trackId: {
				userId: userId,
				trackId: trackId,
			}
		},
	});
};

export { findLikeUser,findAllLikesUser, createLikeUser, deleteLikeUser }