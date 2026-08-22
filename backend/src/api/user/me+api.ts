import { errorHandler } from "@/utils/error";
import { getUserById } from "../../../prisma/database/user";
import { getUserFromToken } from "@/utils/token";

export async function GET(req: Request): Promise<Response> {
  return errorHandler(async () => {
    const userId = await getUserFromToken(req);

    if (!userId)
      return Response.json({ success: false, message: 'No token provided' }, { status: 401 });

    const user = await getUserById(userId, {});

    if (!user)
      return Response.json({ success: false, message: 'User not found' }, { status: 404 });

    return Response.json(
      { success: true, user: { id: user.id, email: user.email } },
      { status: 200 }
    );
  });
}