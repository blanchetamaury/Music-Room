import { errorHandler } from "@/utils/error";
import { getUserFromToken } from "@/utils/token";
import { getUserById } from "../../../prisma/database/user";

export async function GET(req: Request): Promise<Response> {
  return errorHandler(async () => {
    const url = new URL(req.url);
    const user_id_param = url.searchParams.get('user_id');
    const userId = await getUserFromToken(req);

    if (!userId)
      return Response.json({ success: false, message: 'No token provided' }, { status: 401 });

    if (!user_id_param)
		  return Response.json({ error: 'missing user_id' }, { status: 400 })
    
    const me = await getUserById(userId, {});
    const user = await getUserById(user_id_param, {});

    if (!user || !me)
      return Response.json({ success: false, message: 'User not found' }, { status: 404 });

    if (user.id == me.id) {
      const { passwordHash, fortytwoOauthId, fortytwoUserId, googleOauthId, deezerAccessToken, deezerUserId, ...privateUser  } = user;
      return Response.json(
        { success: true, user: { privateUser } },
        { status: 200 }
      );
    }
    const { passwordHash, fortytwoOauthId, fortytwoUserId, googleOauthId, deezerAccessToken, deezerUserId, email, ...publicUser  } = user;
    return Response.json(
      { success: true, user: { publicUser } },
      { status: 200 }
    );
  });
}