import { Track } from '../track/track';

export type PlaylistVisibility = 'PUBLIC' | 'PRIVATE';
export type PlaylistEditPolicy = 'EVERYONE' | 'INVITED_ONLY';
export type PlaylistRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface PlaylistTrackOutput {
	id: string;
	playlistId: string;
	trackId: string;
	position: number;
	addedBy: string;
	addedAt: Date;
	track: Track;
}

export interface PlaylistMember {
	id: string;
	username: string;
	avatarUrl: string | null;
	role: PlaylistRole;
	acceptedAt: Date | null;
}

export interface PlaylistOutput {
	id: string;
	name: string;
	cover: string | null;
	description: string | null;
	ownerId: string;
	visibility: PlaylistVisibility;
	editPolicy: PlaylistEditPolicy;
	version: number;
	members: PlaylistMember[];
	tracks: PlaylistTrackOutput[];
}
