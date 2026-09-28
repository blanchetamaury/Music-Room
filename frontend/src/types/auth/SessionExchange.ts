import { privateUser } from '../user/PrivateUser';

export interface SessionExchangeResult {
	token: string;
	expiresIn: number;
	user: privateUser;
}

export interface LoginResult {
	code: string;
	expiresIn: number;
	user: privateUser;
}
