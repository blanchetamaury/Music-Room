import * as bcrypt from 'bcrypt';
import { FortyTwoCursusUserDetails } from '../../src/types/fortytwo/FortyTwoCursusUserDetails';
import { FortyTwoOauthToken } from '../../src/types/fortytwo/FortyTwoOauthToken';
import { GoogleOauthResponse } from '../../src/types/google/GoogleOauthResponse';
import { GoogleOauthToken } from '../../src/types/google/GoogleOauthToken';
import { Prisma } from '../generated/client';
import { prisma } from './prisma';

const createOrUpdateFortyTwoUser = async (
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

const createOrUpdateGoogleUser = async (
    profile: GoogleOauthResponse,
    authorization: GoogleOauthToken
): Promise<Prisma.UserGetPayload<Prisma.UserDefaultArgs>> => {

    return prisma.user.upsert({
        where: { email: profile.email },
        create: {
            email: profile.email,
            username: profile.name ?? profile.given_name ?? 'Unknown',
            avatarUrl: profile.picture,
            google_oauth: {
                create: {
                    access_token: authorization.access_token,
                    refresh_token: authorization.refresh_token ?? null,
                    token_type: authorization.token_type,
                    expires_in: authorization.expires_in,
                },
            },
        },
        update: {
            google_oauth: {
                upsert: {
                    update: {
                        access_token: authorization.access_token,
                        refresh_token: authorization.refresh_token ?? null,
                        token_type: authorization.token_type,
                        expires_in: authorization.expires_in,
                    },
                    create: {
                        access_token: authorization.access_token,
                        refresh_token: authorization.refresh_token ?? null,
                        token_type: authorization.token_type,
                        expires_in: authorization.expires_in,
                    },
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

const updateUserPassword = async (
	mail: string,
	password: string,
): Promise<Prisma.UserGetPayload<Prisma.UserDefaultArgs>> => {
	return prisma.user.update({
		where: {email: mail},
		data: {
			passwordHash: await bcrypt.hash(password, 10),
		},
	});
};

const existUserByMail = async (mail: string): Promise<boolean> => {
	return (await getUserByMail(mail, {})) !== null;
};

export { createOrUpdateFortyTwoUser, createOrUpdateGoogleUser, createUser, existUserByMail, getUserByMail, updateUserPassword };
