import { errorHandler, ERRORS_DETAILS } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { isUniqueViolation } from '@/utils/prisma';
import { parseBody } from '@/utils/parsing';
import { AcceptEventInvitationSchema, EventMemberInviteSchema, EventMemberRefSchema } from '@/schema/EventMemberSchema';
import { canEditEvent, canReadEvent } from '@/lib/permissions';
import { prisma } from '../../../../prisma/database/prisma';
import { getUserById, getUserByUsername } from '../../../../prisma/database/user';
import { publishEventChange } from '@/lib/realtimePublish';
import { z } from 'zod';

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);

		const eventId = new URL(req.url).searchParams.get('event_id');
		if (!eventId) return Response.json({ success: false, message: 'No event ID provided' }, { status: 400 });

		if (!(await canReadEvent(eventId, userId))) {
			return Response.json({ success: false, message: 'Event not found' }, { status: 404 });
		}

		const members = await prisma.musicEventMember.findMany({
			where: { eventId },
			include: { user: { select: { id: true, username: true, avatarUrl: true } } },
			orderBy: { invitedAt: 'asc' },
		});

		return Response.json(
			{
				success: true,
				data: {
					members: members.map((m) => ({
						id: m.user.id,
						username: m.user.username,
						avatarUrl: m.user.avatarUrl,
						role: m.role,
						status: m.acceptedAt ? 'ACCEPTED' : 'PENDING',
					})),
					pendingInvites: members.filter((m) => !m.acceptedAt).map((m) => m.user.id),
				},
			},
			{ status: 200 }
		);
	});
}

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const requesterId = await requireVerifiedEmail(req);

		const body = await parseBody<z.infer<typeof EventMemberInviteSchema>>(req, EventMemberInviteSchema);

		if (!body.username && !body.userId) throw ERRORS_DETAILS.missing_parameter();

		if (!(await canEditEvent(body.eventId, requesterId))) throw ERRORS_DETAILS.permission_denied();

		const targetId = body.userId ?? (await getUserByUsername(body.username!))?.id;
		if (!targetId) throw ERRORS_DETAILS.invalid_parameter();
		if (targetId === requesterId) throw ERRORS_DETAILS.invalid_parameter();

		const event = await prisma.musicEvent.findUnique({
			where: { id: body.eventId },
			select: { ownerId: true },
		});
		if (!event) return Response.json({ success: false, message: 'Event not found' }, { status: 404 });

		if (body.role === 'ADMIN' && event.ownerId !== requesterId) {
			throw ERRORS_DETAILS.permission_denied();
		}

		const target = await getUserById(targetId, {});
		if (!target) throw ERRORS_DETAILS.invalid_parameter();

		const existing = await prisma.musicEventMember.findUnique({
			where: { eventId_userId: { eventId: body.eventId, userId: targetId } },
		});
		if (existing) throw ERRORS_DETAILS.already_exist();

		let member: { role: string };
		try {
			member = await prisma.musicEventMember.create({
				data: { eventId: body.eventId, userId: targetId, role: body.role },
			});
		} catch (e) {
			if (isUniqueViolation(e)) throw ERRORS_DETAILS.already_exist();
			throw e;
		}

		publishEventChange(body.eventId, 'member.invited', requesterId);

		return Response.json(
			{
				success: true,
				data: {
					id: target.id,
					username: target.username,
					role: member.role,
					status: 'PENDING',
				},
			},
			{ status: 201 }
		);
	});
}

export async function PATCH(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const requesterId = await requireVerifiedEmail(req);

		const body = await parseBody<z.infer<typeof AcceptEventInvitationSchema>>(req, AcceptEventInvitationSchema);

		if (body.userId && body.userId !== requesterId) throw ERRORS_DETAILS.permission_denied();

		const membership = await prisma.musicEventMember.findUnique({
			where: { eventId_userId: { eventId: body.eventId, userId: requesterId } },
		});
		if (!membership) throw ERRORS_DETAILS.permission_denied();

		await prisma.musicEventMember.update({
			where: { id: membership.id },
			data: { acceptedAt: new Date() },
		});

		publishEventChange(body.eventId, 'member.joined', requesterId);

		return Response.json({ success: true, data: { status: 'ACCEPTED' } }, { status: 200 });
	});
}

export async function DELETE(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const requesterId = await requireVerifiedEmail(req);

		const body = await parseBody<z.infer<typeof EventMemberRefSchema>>(req, EventMemberRefSchema);

		const targetId = body.userId ?? requesterId;

		const event = await prisma.musicEvent.findUnique({
			where: { id: body.eventId },
			select: { ownerId: true },
		});
		if (!event) return Response.json({ success: false, message: 'Event not found' }, { status: 404 });

		if (targetId === event.ownerId) throw ERRORS_DETAILS.permission_denied();

		const isSelf = targetId === requesterId;
		if (!isSelf && !(await canEditEvent(body.eventId, requesterId))) {
			throw ERRORS_DETAILS.permission_denied();
		}

		const membership = await prisma.musicEventMember.findUnique({
			where: { eventId_userId: { eventId: body.eventId, userId: targetId } },
		});
		if (!membership) {
			return Response.json({ success: false, message: 'Member not found' }, { status: 404 });
		}

		await prisma.musicEventMember.delete({ where: { id: membership.id } });
		publishEventChange(body.eventId, 'member.removed', requesterId);

		return Response.json({ success: true }, { status: 200 });
	});
}
