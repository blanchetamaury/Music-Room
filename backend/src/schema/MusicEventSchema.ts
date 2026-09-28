import * as z from 'zod';

export const CreateEventSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().max(500).optional(),
	visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
	votingPolicy: z.enum(['EVERYONE', 'INVITED_ONLY', 'LOCATION_TIME']).default('EVERYONE'),
	latitude: z.number().min(-90).max(90).optional(),
	longitude: z.number().min(-180).max(180).optional(),
	radius: z.number().int().positive().max(100000).optional(),
	startAt: z.coerce.date().optional(),
	endAt: z.coerce.date().optional(),
});

export const EventTrackSchema = z
	.object({
		eventId: z.string().min(1),
		trackId: z.string().min(1),
		latitude: z.number().min(-90).max(90).optional(),
		longitude: z.number().min(-180).max(180).optional(),
	})
	.refine((v) => (v.latitude === undefined) === (v.longitude === undefined), {
		message: 'latitude and longitude must be provided together',
		path: ['longitude'],
	});

export const EventTrackStatusSchema = z.object({
	eventId: z.string().min(1),
	trackId: z.string().min(1),
	status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'PLAYING', 'PLAYED']),
});

export const EventVoteSchema = EventTrackSchema;
