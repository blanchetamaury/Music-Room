import { FortyTwoCursus } from './FortyTwoCursus';
import { FortyTwoCursusSkill } from './FortyTwoCursusSkill';
import { FortyTwoUser } from './FortyTwoUser';

export interface FortyTwoCursusUser {
	id: number;
	begin_at: string;
	end_at: string | null;
	grade: string;
	level: number;
	skills: FortyTwoCursusSkill[];
	cursus_id: number;
	has_coalition: boolean;
	blackholed_at: string | null;
	created_at: string;
	updated_at: string | null;
	user: FortyTwoUser;
	cursus: FortyTwoCursus;
}
