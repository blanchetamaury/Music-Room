import { FortyTwoProject } from './FortyTwoProject';

export interface FortyTwoProjectUser {
	id: number;
	occurrence: number;
	final_mark: number | null;
	status: 'in_progress' | 'finished';
	'validated?': boolean;
	current_team_id: number;
	project: FortyTwoProject;
	cursus_ids: number[];
	marked_at: string | null;
	marked: boolean;
	retriable_at: string | null;
	created_at: string;
	updated_at: string;
}
