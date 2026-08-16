import { FortyTwoUserImage } from './FortyTwouserImage';

export interface FortyTwoUser {
	id: number;
	email: string;
	login: string;
	first_name: string;
	last_name: string;
	usual_full_name: string;
	usual_first_name: string;
	url: string;
	phone: string | 'hidden';
	displayname: string;
	kind: 'student' | 'admin' | string;
	image: FortyTwoUserImage;
	'staff?': boolean;
	correction_point: number;
	pool_month: string;
	pool_year: string;
	location: string | null;
	wallet: number;
	anonymize_date: string;
	data_erasure_date: string;
	created_at: string;
	updated_at: string | null;
	alumnized_at: string | null;
	'alumni?': boolean;
	'active?': boolean;
}
