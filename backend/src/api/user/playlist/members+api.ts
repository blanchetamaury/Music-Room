import { errorHandler, ERRORS_DETAILS } from '@/utils/error';
import { requireVerifiedEmail } from '@/lib/require-verified-email';
import { isUniqueViolation } from '@/utils/prisma';
import { parseBody } from '@/utils/parsing';
import { canReadPlaylist } from '@/lib/permissions';
import {
	AcceptPlaylistInvitationSchema,
	InviteByUsernameSchema,
	PlaylistMemberSchema,
} from '@/schema/PlaylistMemberSchema';
import { acceptInvitation, addMember, getMembers, removeMember } from '../../../../prisma/database/playlists';
import { getUserById, getUserByUsername } from '../../../../prisma/database/user';
import { prisma } from '../../../../prisma/database/prisma';
import { z } from 'zod';

export async function GET(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const userId = await requireVerifiedEmail(req);

		const playlistId = new URL(req.url).searchParams.get('playlist_id');
		if (!playlistId) return Response.json({ success: false, message: 'No playlist ID provided' }, { status: 400 });

		if (!(await canReadPlaylist(playlistId, userId))) {
			return Response.json({ success: false, message: 'Playlist not found' }, { status: 404 });
		}

		const [members, pending] = await Promise.all([
			getMembers(playlistId),
			prisma.playlistMember.findMany({
				where: { playlistId, acceptedAt: null },
				select: { userId: true },
			}),
		]);

		return Response.json(
			{
				success: true,
				data: {
					members: members.map((m) => ({
						id: m.user.id,
						username: m.user.username,
						avatarUrl: m.user.avatarUrl,
						role: m.role,
						acceptedAt: m.acceptedAt,
					})),
					pendingInvites: pending.map((p) => p.userId),
				},
			},
			{ status: 200 }
		);
	});
}

export async function POST(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const requesterId = await requireVerifiedEmail(req);

		const body = await parseBody<z.infer<typeof PlaylistMemberSchema> | z.infer<typeof InviteByUsernameSchema>>(
			req,
			PlaylistMemberSchema.or(InviteByUsernameSchema)
		);

		const targetUserId = 'userId' in body ? body.userId : (await getUserByUsername(body.username))?.id;

		if (!targetUserId) throw ERRORS_DETAILS.invalid_parameter();
		if (targetUserId === requesterId) throw ERRORS_DETAILS.invalid_parameter();

		const playlist = await prisma.playlist.findUnique({
			where: { id: body.playlistId },
			select: { ownerId: true },
		});

		if (!playlist) return Response.json({ success: false, message: 'Playlist not found' }, { status: 404 });
		if (playlist.ownerId !== requesterId) throw ERRORS_DETAILS.permission_denied();

		const existing = await prisma.playlistMember.findUnique({
			where: { playlistId_userId: { playlistId: body.playlistId, userId: targetUserId } },
		});

		if (existing) throw ERRORS_DETAILS.already_exist();

		const target = await getUserById(targetUserId, {});
		if (!target) throw ERRORS_DETAILS.invalid_parameter();

		const role = 'role' in body ? body.role : 'EDITOR';
		try {
			await addMember(body.playlistId, targetUserId, role === 'OWNER' ? 'EDITOR' : role);
		} catch (e) {
			if (isUniqueViolation(e)) throw ERRORS_DETAILS.already_exist();
			throw e;
		}

		return Response.json(
			{ success: true, data: { id: targetUserId, username: target.username, role } },
			{ status: 201 }
		);
	});
}

export async function DELETE(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const requesterId = await requireVerifiedEmail(req);

		const body = await parseBody<z.infer<typeof PlaylistMemberSchema>>(req, PlaylistMemberSchema);

		const playlist = await prisma.playlist.findUnique({
			where: { id: body.playlistId },
			select: { ownerId: true },
		});

		if (!playlist) return Response.json({ success: false, message: 'Playlist not found' }, { status: 404 });

		if (playlist.ownerId === requesterId) {
			if (body.userId === requesterId) throw ERRORS_DETAILS.permission_denied();
			try {
				await removeMember(body.playlistId, body.userId, requesterId);
			} catch {
				throw ERRORS_DETAILS.permission_denied();
			}
			return Response.json({ success: true }, { status: 200 });
		}

		if (body.userId !== requesterId) throw ERRORS_DETAILS.permission_denied();

		await prisma.playlistMember.delete({
			where: { playlistId_userId: { playlistId: body.playlistId, userId: requesterId } },
		});

		return Response.json({ success: true }, { status: 200 });
	});
}

export async function PATCH(req: Request): Promise<Response> {
	return errorHandler(async () => {
		const requesterId = await requireVerifiedEmail(req);

		const body = await parseBody<z.infer<typeof AcceptPlaylistInvitationSchema>>(
			req,
			AcceptPlaylistInvitationSchema
		);

		// The target user is always the authenticated caller; a `userId` in the body
		// would let a client act on someone else's membership.
		if (body.userId && body.userId !== requesterId) throw ERRORS_DETAILS.permission_denied();

		const membership = await prisma.playlistMember.findUnique({
			where: { playlistId_userId: { playlistId: body.playlistId, userId: requesterId } },
		});

		if (!membership) throw ERRORS_DETAILS.permission_denied();
		if (membership.role === 'OWNER') throw ERRORS_DETAILS.permission_denied();

		await acceptInvitation(body.playlistId, requesterId);

		return Response.json({ success: true }, { status: 200 });
	});
}
