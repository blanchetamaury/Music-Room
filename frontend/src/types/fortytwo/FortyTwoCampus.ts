import { FortyTwolanguage } from './FortyTwolanguage';

export interface FortyTwoCampus {
	id: number;
	name: string;
	time_zone: string;
	language: FortyTwolanguage;
	users_count: number;
	vogsphere_id: number;
	country: string;
	address: string;
	zip: string;
	city: string;
	website: string;
	facebook: string;
	twitter: string;
	active: boolean;
	public: boolean;
	mail_extension: string;
	default_hidden_phone: boolean;
}
