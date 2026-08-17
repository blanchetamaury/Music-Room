
import { z } from 'zod'
import { errorHandler } from '../../../../../utils/error'
import { parseBody } from '../../../../../utils/parsing'

const ResetPasswordConfirmSchema = z.object({
  mail: z.string().email(),
  code: z.string().length(6),
  password: z.string().min(8),
})

interface ResetPasswordConfirm {
  mail: string;
  code: string;
  password: string,
}

export async function POST(req: Request): Promise<Response> {
  return errorHandler(async () => {
    const body = await parseBody<ResetPasswordConfirm>(req, ResetPasswordConfirmSchema)

    console.log('Password reset confirmed for:', body.mail, 'with code:', body.code)

    return Response.json(
      { data: { message: 'Password has been reset' } },
      { status: 200 }
    )
  })
}