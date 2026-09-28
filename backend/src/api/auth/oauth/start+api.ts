import { rateLimit } from '@/lib/apply-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import * as z from 'zod';
import { errorHandler, ERRORS_DETAILS } from '@/utils/error';
import { parseBody } from '@/utils/parsing';
import { requireUser } from '@/lib/require-verified-email';
import { createOAuthState, deleteExpiredOAuthStates } from '../../../../prisma/database/oauthState';
import { hasLinkedProvider } from '../../../../prisma/database/user';
import { buildAuthorizationUrl, isValidClientType } from '@/oauth/authorize';

const OAuthStartSchema = z.object({
	provider: z.enum(['google', 'fortytwo']),
	clientType: z.enum(['web', 'mobile']).default('web'),
	link: z.coerce.boolean().default(false),
});

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const limited = await rateLimit(req, RATE_LIMITS.oauthStart);
		if (limited) return limited;

		const body = await parseBody<z.infer<typeof OAuthStartSchema>>(req, OAuthStartSchema);

		if (!isValidClientType(body.clientType)) throw ERRORS_DETAILS.invalid_parameter();

		let linkUserId: string | null = null;
		if (body.link) {
			linkUserId = await requireUser(req);

			const providerName = body.provider === 'google' ? 'GOOGLE' : 'FORTYTWO';
			if (await hasLinkedProvider(linkUserId, providerName)) {
				return Response.json(
					{ success: false, message: `This account is already linked to ${body.provider}` },
					{ status: 409 }
				);
			}
		}

		const providerName = body.provider === 'google' ? 'GOOGLE' : 'FORTYTWO';
		const { state } = await createOAuthState({
			provider: providerName,
			clientType: body.clientType,
			linkUserId,
		});

		void deleteExpiredOAuthStates();

		return Response.json(
			{
				success: true,
				data: { authorizationUrl: buildAuthorizationUrl(body.provider, state), link: body.link },
			},
			{ status: 201 }
		);
	});
}
