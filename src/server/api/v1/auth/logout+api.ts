import { Request } from "express"
import { verifyCsrf } from "../../../lib/csrf"
import { errorHandler, ERRORS_DETAILS } from "../../../utils/error"


export async function POST(req: Request): Promise<Response> {
  return errorHandler(async () => {
    const isValidCsrf = verifyCsrf(req)
    if (!isValidCsrf) throw ERRORS_DETAILS.permission_denied()

    const headers = new Headers()
    headers.append('Set-Cookie', 'session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax')
    headers.append('Set-Cookie', 'csrf_token=; Path=/; Max-Age=0; SameSite=Strict')

    return new Response(JSON.stringify({ data: { message: 'Logged out successfully' } }), {
      status: 200,
      headers,
    })
  })
}