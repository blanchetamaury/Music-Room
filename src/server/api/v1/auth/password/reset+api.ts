import { z } from 'zod'
import { errorHandler } from '../../../../utils/error'
import { parseBody } from '../../../../utils/parsing'

const ResetPasswordRequestSchema = z.object({
  mail: z.string().email(),
})

interface ResetPasswordRequest {
  mail: string;
}

export async function POST(req: Request): Promise<Response> {
  return errorHandler(async () => {
    const body = await parseBody<ResetPasswordRequest>(req, ResetPasswordRequestSchema)

    console.log('Password reset requested for:', body.mail)

    return Response.json(
      { data: { message: 'If the email exists, a reset code has been sent' } },
      { status: 200 }
    )
  })
}