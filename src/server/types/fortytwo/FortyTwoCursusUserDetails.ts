import { FortyTwoAchievements } from './FortyTwoAchievements';
import { FortyTwoCampus } from './FortyTwoCampus';
import { FortyTwoCampusUser } from './FortyTwoCampusUser';
import { FortyTwoCursusUser } from './FortyTwoCursusUser';
import { FortyTwoExpertisesUser } from './FortyTwoExpertisesUser';
import { FortyTwolanguageUser } from './FortyTwoLanguageUser';
import { FortyTwoProjectUser } from './FortyTwoProjectUser';
import { FortyTwoTitle } from './FortyTwoTitle';
import { FortyTwoTitleUser } from './FortyTwoTitleUser';
import { FortyTwoUser } from '@/types/fortytwo/FortyTwoUser';

export interface FortyTwoCursusUserDetails extends FortyTwoUser {
	groups: unknown[];
	cursus_users: FortyTwoCursusUser[];
	projects_users: FortyTwoProjectUser[];
	languages_users: FortyTwolanguageUser[];
	achievements: FortyTwoAchievements[];
	titles: FortyTwoTitle[];
	titles_users: FortyTwoTitleUser[];
	partnerships: unknown[];
	patroned: unknown[];
	patroning: unknown[];
	expertises_users: FortyTwoExpertisesUser[];
	roles: unknown[];
	campus: FortyTwoCampus[];
	campus_users: FortyTwoCampusUser[];
}
