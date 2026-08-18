import { JWTPayload } from 'jose';

export interface SessionPayload {
	user_id: string;
}

export interface JWTSessionPayload extends JWTPayload, SessionPayload {
	exp: number;
}
