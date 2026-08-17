import { Request } from "express"
import { getThrowableSession } from "../../../lib/session"
import { getUserByMail } from "../../../prisma/user"
import { errorHandler, ERRORS_DETAILS } from "../../../utils/error"

export async function GET(req: Request): Promise<Response> {
  return errorHandler(async () => {
    const session = await getThrowableSession(req)
    const user = await getUserByMail(session.user_id, {
      fortytwo_oauth: true,
      playlists: true,
      likes: true,
      follows: true,
      followers: true,
    })

    if (!user) {
      throw ERRORS_DETAILS.session_expired()
    }

    const { passwordHash, fortytwo_oauth, ...safeUser } = user

    return Response.json({ data: safeUser })
  })
}