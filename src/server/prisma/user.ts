import { FortyTwoCursusUserDetails } from '../../types/fortytwo/FortyTwoCursusUserDetails';
import { FortyTwoOauthToken } from '../../types/fortytwo/FortyTwoOauthToken';
import { Prisma } from './generated/client';
import { prisma } from './prisma';
import * as bcrypt from 'bcrypt';

const createOrUpdateStudentUser = async (
	me: FortyTwoCursusUserDetails,
	authorization: FortyTwoOauthToken
): Promise<Prisma.UserGetPayload<Prisma.UserDefaultArgs>> => {

	const token_body = {
		access_token: authorization.access_token,
		refresh_token: authorization.refresh_token,
	};

	return prisma.user.upsert({
		where: { fortytwo_user_id: me.id },
		create: {
			fortytwo_user_id: me.id,
			email: me.email,
			username: me.usual_full_name,
			avatarUrl: me.image.versions.medium,
			fortytwo_oauth: { create: { ...token_body } },
		},
		update: {
			fortytwo_oauth: {
				upsert: {
					update: { ...token_body },
					create: { ...token_body },
				},
			},
		},
	});
};

const getUserByMail = async <T extends Prisma.UserInclude>(
	email: string,
	include: T
): Promise<Prisma.UserGetPayload<{ include: T }> | null> => {
	return prisma.user.findUnique({
		where: { email },
		include,
	});
};

const createUser = async (
	mail: string,
	password: string,
	username: string,
): Promise<Prisma.UserGetPayload<Prisma.UserDefaultArgs>> => {
	return prisma.user.create({
		data: {
			fortytwo_user_id: null,
			email: mail,
			passwordHash: await bcrypt.hash(password, 10),
			fortytwo_oauth: undefined,
			fortytwo_oauth_id: null,
			username: username,
		},
	});
};

const existUserByMail = async (mail: string): Promise<boolean> => {
	return (await getUserByMail(mail, {})) !== null;
};

export { createOrUpdateStudentUser, getUserByMail, createUser, existUserByMail }