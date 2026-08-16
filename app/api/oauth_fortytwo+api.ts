import { getFortyTwoMe, getFortyTwoOauthToken } from '@/rest/fortytwo';
import { createAndSetSession } from '@/lib/session';
import { FortyTwoOauthToken } from '@/types/fortytwo/FortyTwoOauthToken';
import { FortyTwoCursusUserDetails } from '@/types/fortytwo/FortyTwoCursusUserDetails';
import { setCsrfToken } from '@/lib/csrf';
import { errorHandler } from '@/utils/error';
import { createOrUpdateStudentUser } from '@/prisma/user';

export async function GET(request: Request): Promise<Response> {
	return errorHandler(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		const code: string | null = urlParams.get('code');
		if (code === null) return Response.json({ "success": false, "redirect": '/' });

		const authorization: FortyTwoOauthToken = await getFortyTwoOauthToken(code);
		const me: FortyTwoCursusUserDetails = await getFortyTwoMe(authorization.access_token);

		const user = await createOrUpdateStudentUser(me, authorization);

		await createAndSetSession({
			user_id: user.id,
		});

		await setCsrfToken();

		return Response.json({ "success": false, "redirect": '/home' })
	});
}