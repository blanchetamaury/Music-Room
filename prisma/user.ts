import { FortyTwoCursusUserDetails } from "@/types/fortytwo/FortyTwoCursusUserDetails";
import { FortyTwoOauthToken } from "@/types/fortytwo/FortyTwoOauthToken";
import { Prisma } from "./generated/client";
import { prisma } from "./prisma";

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

export { createOrUpdateStudentUser }