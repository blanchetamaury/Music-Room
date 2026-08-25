import { errorHandler } from "@/utils/error";
import { getUserFromToken } from "@/utils/token";
import { getUserById } from "../../../../prisma/database/user";
import { deleteLikeUser } from "../../../../prisma/database/like";

export async function DELETE(req: Request): Promise<Response> {
  return errorHandler(async () => {
    const userId = await getUserFromToken(req);
	const url = new URL(req.url);
    const trackId = url.searchParams.get('track_id');
	
	if (!trackId) {
		return Response.json({ error: 'missing query' }, { status: 400 })
	}

    if (!userId)
      return Response.json({ success: false, message: 'No token provided' }, { status: 401 });
    const user = await getUserById(userId, {});

    if (!user)
      return Response.json({ success: false, message: 'User not found' }, { status: 404 });

	const like = await deleteLikeUser({}, user.id, trackId);
	return Response.json(
      { success: true, like},
      { status: 200 }
    );
  });
}