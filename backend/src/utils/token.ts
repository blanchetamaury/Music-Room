import { jwtVerify } from 'jose';
import { getSessionSecret } from '../lib/session-secret';

export async function getUserFromToken(req: Request): Promise<string | null> {
	const authHeader = req.headers.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

	const token = authHeader.split(' ')[1];
	try {
		const { payload } = await jwtVerify(token, getSessionSecret(), {
			issuer: 'music room',
			algorithms: ['HS256'],
		});
		return payload.user_id as string;
	} catch (err) {
		console.error(`Error to get token ${err}`);
		return null;
	}
}
