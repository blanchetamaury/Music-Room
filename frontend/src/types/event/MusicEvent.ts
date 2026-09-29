import { Track } from '../track/track';

export type EventVisibility = 'PUBLIC' | 'PRIVATE';
export type EventVotingPolicy = 'EVERYONE' | 'INVITED_ONLY' | 'LOCATION_TIME';
export type EventRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type EventTrackStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PLAYING' | 'PLAYED';

export interface EventOwner {
	id: string;
	username: string;
	avatarUrl: string | null;
}

export interface EventMember {
	id: string;
	username: string;
	avatarUrl: string | null;
	role: EventRole;
	/** Pending until the invitation is accepted; the backend sends it on the members list. */
	status?: 'PENDING' | 'ACCEPTED';
}

export interface EventMembersResponse {
	members: EventMember[];
	pendingInvites: string[];
}

export interface EventTrack {
	trackId: string;
	status: EventTrackStatus;
	voteCount: number;
	suggestedBy: string;
	createdAt: Date;
	votedByMe: boolean;
	track: Track | null;
}

export interface MusicEventSummary {
	id: string;
	name: string;
	description: string | null;
	visibility: EventVisibility;
	votingPolicy: EventVotingPolicy;
	ownerId: string;
	owner: EventOwner | null;
	memberCount: number;
	createdAt: Date;
}

export interface MusicEvent extends Omit<MusicEventSummary, 'memberCount' | 'owner'> {
	latitude: number | null;
	longitude: number | null;
	radius: number | null;
	startAt: Date | null;
	endAt: Date | null;
	members: EventMember[];
	tracks: EventTrack[];
	canEdit: boolean;
	myRole: EventRole | null;
	myInvitationStatus: 'PENDING' | 'ACCEPTED' | null;
}

export interface GeoPosition {
	latitude: number;
	longitude: number;
}

export interface VoteResult {
	voted: boolean;
	voteCount: number;
}
