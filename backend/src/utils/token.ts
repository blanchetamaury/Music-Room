import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
	process.env.SESSION_SECRET || 'jgn3rjngrjendkjjtr54u35iu43ioi1ri3or1ejditjdc.sw;sp[3flpr3mfknrj'
);

export async function getUserFromToken(req: Request): Promise<string | null> {
	const authHeader = req.headers.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

	const token = authHeader.split(' ')[1];
	try {
		const { payload } = await jwtVerify(token, JWT_SECRET, {
			issuer: 'music room',
		});
		return payload.user_id as string;
	} catch (err) {
		return null;
	}
}
