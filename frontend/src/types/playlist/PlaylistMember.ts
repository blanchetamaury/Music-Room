import { PlaylistMember } from './PlaylistOutput';

export type { PlaylistMember };

export interface PlaylistMembersResponse {
	members: PlaylistMember[];
	pendingInvites: string[];
}
