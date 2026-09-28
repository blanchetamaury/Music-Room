import * as bcrypt from 'bcrypt';
import { FortyTwoCursusUserDetails } from '../../src/types/fortytwo/FortyTwoCursusUserDetails';
import { FortyTwoOauthToken } from '../../src/types/fortytwo/FortyTwoOauthToken';
import { GoogleOauthResponse } from '../../src/types/google/GoogleOauthResponse';
import { GoogleOauthToken } from '../../src/types/google/GoogleOauthToken';
import { Prisma } from '../generated/client';
import { prisma } from './prisma';
import { encryptToken } from '../../src/lib/token-encryption';

const seal = (token: string | null | undefined): string | null => (token == null ? null : encryptToken(token));

const createOrUpdateFortyTwoUser = async (
	me: FortyTwoCursusUserDetails,
	authorization: FortyTwoOauthToken
): Promise<Prisma.UserGetPayload<Prisma.UserDefaultArgs>> => {
	const token_body = {
		access_token: seal(authorization.access_token),
		refresh_token: seal(authorization.refresh_token),
	};

	return prisma.user.upsert({
		where: {
			email: me.email,
		},
		create: {
			fortytwoUserId: me.id,
			email: me.email,
			username: me.usual_full_name,
			avatarUrl: me.image.versions.medium,
			emailVerified: true,
			fortytwoOauth: { create: { ...token_body } },
		},
		update: {
			fortytwoUserId: me.id,
			fortytwoOauth: {
				upsert: {
					update: { ...token_body },
					create: { ...token_body },
				},
			},
		},
	});
};

const createOrUpdateGoogleUser = async (
	profile: GoogleOauthResponse,
	authorization: GoogleOauthToken
): Promise<Prisma.UserGetPayload<Prisma.UserDefaultArgs>> => {
	const token_body = {
		access_token: seal(authorization.access_token),
		refresh_token: seal(authorization.refresh_token ?? null),
		token_type: authorization.token_type,
		expires_in: authorization.expires_in,
	};

	return prisma.user.upsert({
		where: { email: profile.email },
		create: {
			email: profile.email,
			username: profile.name ?? profile.given_name ?? 'Unknown',
			avatarUrl: profile.picture,
			emailVerified: true,
			googleOauth: { create: { ...token_body } },
		},
		update: {
			googleOauth: {
				upsert: {
					update: { ...token_body },
					create: { ...token_body },
				},
			},
		},
	});
};

const linkFortyTwoUser = async (userId: string, me: FortyTwoCursusUserDetails, authorization: FortyTwoOauthToken) => {
	const token_body = {
		access_token: seal(authorization.access_token),
		refresh_token: seal(authorization.refresh_token),
	};

	return prisma.user.update({
		where: { id: userId },
		data: {
			fortytwoUserId: me.id,
			emailVerified: true,
			fortytwoOauth: { upsert: { update: { ...token_body }, create: { ...token_body } } },
		},
	});
};

const linkGoogleUser = async (userId: string, profile: GoogleOauthResponse, authorization: GoogleOauthToken) => {
	const token_body = {
		access_token: seal(authorization.access_token),
		refresh_token: seal(authorization.refresh_token ?? null),
		token_type: authorization.token_type,
		expires_in: authorization.expires_in,
	};

	return prisma.user.update({
		where: { id: userId },
		data: {
			emailVerified: true,
			googleOauth: { upsert: { update: { ...token_body }, create: { ...token_body } } },
		},
	});
};

const hasLinkedProvider = async (userId: string, provider: 'GOOGLE' | 'FORTYTWO'): Promise<boolean> => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { googleOauthId: true, fortytwoUserId: true },
	});
	if (!user) return false;
	return provider === 'GOOGLE' ? user.googleOauthId !== null : user.fortytwoUserId !== null;
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
	username: string
): Promise<Prisma.UserGetPayload<Prisma.UserDefaultArgs>> => {
	return prisma.user.create({
		data: {
			fortytwoUserId: null,
			email: mail,
			passwordHash: await bcrypt.hash(password, 10),
			fortytwoOauth: undefined,
			fortytwoOauthId: null,
			username: username,
			emailVerified: false,
		},
	});
};

const updateUserPassword = async (
	mail: string,
	password: string
): Promise<Prisma.UserGetPayload<Prisma.UserDefaultArgs>> => {
	return prisma.user.update({
		where: { email: mail },
		data: {
			passwordHash: await bcrypt.hash(password, 10),
		},
	});
};

const existUserByMail = async (mail: string): Promise<boolean> => {
	return (await getUserByMail(mail, {})) !== null;
};

const getUserById = async <T extends Prisma.UserInclude>(
	id: string,
	include: T
): Promise<Prisma.UserGetPayload<{ include: T }> | null> => {
	return prisma.user.findUnique({
		where: { id },
		include: include,
	});
};

const updateUser = async (
	id: string,
	data: { username?: string; avatarUrl?: string | null; emailVerified?: boolean }
) => {
	return prisma.user.update({ where: { id }, data });
};

const getUserByUsername = async (username: string): Promise<Prisma.UserGetPayload<Prisma.UserDefaultArgs> | null> => {
	return prisma.user.findFirst({ where: { username } });
};

const setEmailVerified = async (id: string) => {
	return prisma.user.update({ where: { id }, data: { emailVerified: true } });
};

export {
	createOrUpdateFortyTwoUser,
	createOrUpdateGoogleUser,
	linkFortyTwoUser,
	linkGoogleUser,
	hasLinkedProvider,
	createUser,
	existUserByMail,
	getUserById,
	getUserByMail,
	getUserByUsername,
	updateUser,
	updateUserPassword,
	setEmailVerified,
};
