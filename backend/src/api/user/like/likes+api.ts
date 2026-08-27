import { errorHandler } from "@/utils/error";
import { getUserFromToken } from "@/utils/token";
import { getUserById } from "../../../../prisma/database/user";
import { findAllLikesUser } from "../../../../prisma/database/like";

export async function GET(req: Request): Promise<Response> {
  return errorHandler(async () => {
    const userId = await getUserFromToken(req);

    if (!userId)
      return Response.json({ success: false, message: 'No token provided' }, { status: 401 });
    const user = await getUserById(userId, {});

    if (!user)
      return Response.json({ success: false, message: 'User not found' }, { status: 404 });

	const likes = await findAllLikesUser({ track: true }, user.id);
	return Response.json(
      { success: true, likes },
      { status: 200 }
    );
  });
}