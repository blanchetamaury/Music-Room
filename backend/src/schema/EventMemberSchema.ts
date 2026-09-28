import * as z from 'zod';

export const EventMemberInviteSchema = z.object({
	eventId: z.string().min(1),
	username: z.string().min(3).max(30).optional(),
	userId: z.string().min(1).optional(),
	role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

export const EventMemberRefSchema = z.object({
	eventId: z.string().min(1),
	userId: z.string().min(1),
});

export const AcceptEventInvitationSchema = z.object({
	eventId: z.string().min(1),
	userId: z.string().min(1).optional(),
});

export const UpdateEventSchema = z.object({
	eventId: z.string().min(1),
	name: z.string().min(1).max(100).optional(),
	description: z.string().max(500).nullable().optional(),
	visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
	votingPolicy: z.enum(['EVERYONE', 'INVITED_ONLY', 'LOCATION_TIME']).optional(),
	latitude: z.number().min(-90).max(90).nullable().optional(),
	longitude: z.number().min(-180).max(180).nullable().optional(),
	radius: z.number().int().positive().max(100000).nullable().optional(),
	startAt: z.coerce.date().nullable().optional(),
	endAt: z.coerce.date().nullable().optional(),
});
