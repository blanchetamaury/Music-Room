import { Prisma } from '../generated/client';
import { prisma, runTransaction } from './prisma';
import { isUniqueViolation } from '@/utils/prisma';

const createEvent = async (data: Prisma.MusicEventCreateInput) => {
	return prisma.musicEvent.create({ data });
};

const getEventById = async (id: string) => {
	return prisma.musicEvent.findUnique({
		where: { id },
		include: {
			owner: true,
			members: { include: { user: true } },
			tracks: { include: { votes: true } },
		},
	});
};

const getEvents = async (
	userId: string,
	options?: { visibility?: 'PUBLIC' | 'PRIVATE'; page?: number; limit?: number }
) => {
	const where: Prisma.MusicEventWhereInput = {
		OR: [{ visibility: 'PUBLIC' }, { members: { some: { userId, acceptedAt: { not: null } } } }],
	};

	if (options?.visibility) {
		where.visibility = options.visibility;
	}

	const page = options?.page ?? 1;
	const limit = options?.limit ?? 20;

	const [events, total] = await Promise.all([
		prisma.musicEvent.findMany({
			where,
			include: { owner: true, members: true },
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { createdAt: 'desc' },
		}),
		prisma.musicEvent.count({ where }),
	]);

	return { events, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const updateEvent = async (id: string, data: Prisma.MusicEventUpdateInput) => {
	return prisma.musicEvent.update({ where: { id }, data });
};

const deleteEvent = async (id: string) => {
	return prisma.musicEvent.delete({ where: { id } });
};

const addMember = async (eventId: string, userId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER' = 'MEMBER') => {
	return prisma.musicEventMember.create({
		data: { eventId, userId, role },
	});
};

const acceptInvitation = async (eventId: string, userId: string) => {
	return prisma.musicEventMember.update({
		where: { eventId_userId: { eventId, userId } },
		data: { acceptedAt: new Date() },
	});
};

const removeMember = async (eventId: string, userId: string) => {
	return prisma.musicEventMember.delete({ where: { eventId_userId: { eventId, userId } } });
};

const suggestTrack = async (eventId: string, trackId: string, suggestedBy: string) => {
	const existing = await prisma.eventTrack.findUnique({
		where: { eventId_trackId: { eventId, trackId } },
		select: { id: true },
	});

	if (existing) {
		throw new DuplicateSuggestionError(eventId, trackId);
	}

	try {
		return await prisma.eventTrack.create({
			data: { eventId, trackId, suggestedBy },
		});
	} catch (e) {
		if (isUniqueViolation(e)) {
			throw new DuplicateSuggestionError(eventId, trackId);
		}
		throw e;
	}
};

export const EVENT_TRACK_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'PLAYING', 'PLAYED'] as const;
export type EventTrackStatusValue = (typeof EVENT_TRACK_STATUSES)[number];

const ALLOWED_STATUS_TRANSITIONS: Record<EventTrackStatusValue, EventTrackStatusValue[]> = {
	PENDING: ['APPROVED', 'REJECTED'],
	APPROVED: ['REJECTED', 'PLAYING'],
	REJECTED: ['PENDING'],
	PLAYING: ['PLAYED', 'APPROVED'],
	PLAYED: ['APPROVED'],
};

const canTransitionTrackStatus = (from: string, to: string): boolean =>
	(ALLOWED_STATUS_TRANSITIONS[from as EventTrackStatusValue] ?? []).includes(to as EventTrackStatusValue);

const setTrackStatus = async (eventId: string, trackId: string, status: EventTrackStatusValue) => {
	return prisma.eventTrack.update({
		where: { eventId_trackId: { eventId, trackId } },
		data: { status },
	});
};

const getEventTrackStatus = async (eventId: string, trackId: string) => {
	return prisma.eventTrack.findUnique({
		where: { eventId_trackId: { eventId, trackId } },
		select: { status: true, voteCount: true, suggestedBy: true },
	});
};

export class DuplicateSuggestionError extends Error {
	constructor(
		public readonly eventId: string,
		public readonly trackId: string
	) {
		super('Track already suggested for this event');
		this.name = 'DuplicateSuggestionError';
	}
}

export class EventNotFoundError extends Error {
	constructor() {
		super('Event not found');
	}
}

export class TrackNotInEventError extends Error {
	constructor() {
		super('Track is not part of this event');
	}
}

export class VersionConflictError extends Error {
	constructor() {
		super('VERSION_CONFLICT');
	}
}

const syncVoteCount = async (tx: Prisma.TransactionClient, eventId: string, trackId: string) => {
	const voteCount = await tx.eventVote.count({ where: { eventId, trackId } });
	await tx.eventTrack.update({
		where: { eventId_trackId: { eventId, trackId } },
		data: { voteCount },
	});
	return voteCount;
};

const assertTrackInEvent = async (tx: Prisma.TransactionClient, eventId: string, trackId: string): Promise<void> => {
	const track = await tx.eventTrack.findUnique({
		where: { eventId_trackId: { eventId, trackId } },
		select: { id: true, status: true },
	});
	if (!track) throw new TrackNotInEventError();
};

/** Idempotent add-vote: voting twice is not an error and never double counts. */
const addVote = async (
	eventId: string,
	trackId: string,
	userId: string
): Promise<{ voted: true; voteCount: number; created: boolean }> => {
	return runTransaction(async (tx) => {
		await assertTrackInEvent(tx, eventId, trackId);

		const existing = await tx.eventVote.findUnique({
			where: { eventId_userId_trackId: { eventId, userId, trackId } },
			select: { id: true },
		});

		if (existing) {
			const voteCount = await syncVoteCount(tx, eventId, trackId);
			return { voted: true, voteCount, created: false };
		}

		try {
			await tx.eventVote.create({ data: { eventId, trackId, userId } });
		} catch (e) {
			// Two concurrent votes for the same user and track both pass the pre-check;
			// the loser must still observe a successful, idempotent state.
			if (isUniqueViolation(e)) {
				const voteCount = await syncVoteCount(tx, eventId, trackId);
				return { voted: true, voteCount, created: false };
			}
			throw e;
		}

		const voteCount = await syncVoteCount(tx, eventId, trackId);
		return { voted: true, voteCount, created: true };
	});
};

/** Idempotent remove-vote: removing a vote that does not exist is a no-op, not a 404. */
const removeVote = async (
	eventId: string,
	trackId: string,
	userId: string
): Promise<{ voted: false; voteCount: number; removed: boolean }> => {
	return runTransaction(async (tx) => {
		await assertTrackInEvent(tx, eventId, trackId);

		const existing = await tx.eventVote.findUnique({
			where: { eventId_userId_trackId: { eventId, userId, trackId } },
			select: { id: true },
		});

		if (!existing) {
			const voteCount = await syncVoteCount(tx, eventId, trackId);
			return { voted: false, voteCount, removed: false };
		}

		await tx.eventVote.delete({ where: { id: existing.id } });
		const voteCount = await syncVoteCount(tx, eventId, trackId);
		return { voted: false, voteCount, removed: true };
	});
};

const getEventQueue = async (eventId: string) => {
	return prisma.eventTrack.findMany({
		where: { eventId, status: { in: ['APPROVED', 'PLAYING', 'PLAYED'] } },
		orderBy: [{ voteCount: 'desc' }, { createdAt: 'asc' }],
	});
};

export {
	createEvent,
	getEventById,
	getEvents,
	updateEvent,
	deleteEvent,
	addMember,
	acceptInvitation,
	removeMember,
	suggestTrack,
	addVote,
	removeVote,
	getEventQueue,
	setTrackStatus,
	getEventTrackStatus,
	canTransitionTrackStatus,
};
