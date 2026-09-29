import { ThemedText } from '@/src/components/utils/themed-text';
import { useAuth } from '@/src/context/AuthContext';
import {
	useAcceptEventInvitationMutation,
	useInviteEventMemberMutation,
	useLeaveEventMutation,
} from '@/src/lib/fetcher/tanstack/event';
import type { MusicEvent } from '@/src/types/event/MusicEvent';
import { Check, Crown, LogOut, MailPlus, Shield, UserPlus, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

const styles = StyleSheet.create({
	block: {
		gap: 10,
		marginTop: 14,
		paddingTop: 12,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: 'rgba(255,255,255,0.12)',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	headerLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	headerText: {
		color: 'rgba(255,255,255,0.7)',
		fontSize: 12,
		fontWeight: '700',
	},
	action: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
		paddingVertical: 5,
		paddingHorizontal: 9,
		borderRadius: 999,
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.1)',
	},
	actionPrimary: {
		backgroundColor: 'rgba(62,207,255,0.16)',
		borderColor: 'rgba(62,207,255,0.35)',
	},
	actionDanger: {
		backgroundColor: 'rgba(255,107,107,0.14)',
		borderColor: 'rgba(255,107,107,0.3)',
	},
	actionDisabled: {
		opacity: 0.45,
	},
	actionText: {
		color: '#fff',
		fontSize: 12,
		fontWeight: '600',
	},
	inviteRow: {
		flexDirection: 'row',
		gap: 8,
	},
	inviteInput: {
		flex: 1,
		color: '#fff',
		fontSize: 13,
		paddingVertical: 8,
		paddingHorizontal: 10,
		borderRadius: 10,
		backgroundColor: 'rgba(255,255,255,0.07)',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.12)',
	},
	memberRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingVertical: 3,
	},
	memberName: {
		flex: 1,
		color: 'rgba(255,255,255,0.85)',
		fontSize: 12,
	},
	badge: {
		paddingVertical: 2,
		paddingHorizontal: 6,
		borderRadius: 999,
		backgroundColor: 'rgba(255,255,255,0.08)',
	},
	badgePending: {
		backgroundColor: 'rgba(255,196,107,0.16)',
	},
	badgeText: {
		color: 'rgba(255,255,255,0.65)',
		fontSize: 10,
		fontWeight: '700',
	},
	error: {
		color: '#ff8f8f',
		fontSize: 11,
	},
	pendingBanner: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		padding: 8,
		borderRadius: 10,
		backgroundColor: 'rgba(255,196,107,0.12)',
		borderWidth: 1,
		borderColor: 'rgba(255,196,107,0.28)',
	},
	pendingText: {
		flex: 1,
		color: 'rgba(255,255,255,0.8)',
		fontSize: 11,
	},
});

const roleIcon = (role: string) => {
	if (role === 'OWNER') return <Crown color="#ffc46b" size={12} />;
	if (role === 'ADMIN') return <Shield color="#3ecfff" size={12} />;
	return <Users color="rgba(255,255,255,0.45)" size={12} />;
};

export function EventMembership({ event }: { event: MusicEvent }) {
	const { token } = useAuth();
	const acceptMutation = useAcceptEventInvitationMutation();
	const leaveMutation = useLeaveEventMutation();
	const inviteMutation = useInviteEventMemberMutation();

	const [username, setUsername] = useState('');

	const busy = acceptMutation.isPending || leaveMutation.isPending || inviteMutation.isPending;
	const error = acceptMutation.error?.message || leaveMutation.error?.message || inviteMutation.error?.message;

	const isPending = event.myInvitationStatus === 'PENDING';
	const isMember = event.myInvitationStatus === 'ACCEPTED';
	const isOwner = event.myRole === 'OWNER';

	const handleAccept = () => {
		if (token) acceptMutation.mutate({ token, eventId: event.id });
	};

	const handleLeave = () => {
		if (!token) return;
		// No userId: the backend defaults the target to the caller, so this can only ever
		// remove the current user's own membership.
		leaveMutation.mutate({ token, eventId: event.id });
	};

	const handleInvite = () => {
		const trimmed = username.trim();
		if (!token || trimmed.length === 0) return;
		inviteMutation.mutate({ token, eventId: event.id, username: trimmed, role: isOwner ? 'ADMIN' : 'MEMBER' });
	};

	return (
		<View style={styles.block}>
			<View style={styles.header}>
				<View style={styles.headerLeft}>
					<Users color="#9aa0b5" size={13} />
					<ThemedText style={styles.headerText}>
						{event.members.filter((member) => member.status !== 'PENDING').length} membre
						{event.members.filter((member) => member.status !== 'PENDING').length > 1 ? 's' : ''}
					</ThemedText>
				</View>

				{isPending ? (
					<Pressable
						onPress={handleAccept}
						disabled={busy}
						style={[styles.action, styles.actionPrimary, busy && styles.actionDisabled]}
						accessibilityRole="button"
						accessibilityLabel="Accepter l'invitation"
					>
						{acceptMutation.isPending ? (
							<ActivityIndicator color="#fff" size="small" />
						) : (
							<Check color="#fff" size={13} />
						)}
						<ThemedText style={styles.actionText}>Accepter</ThemedText>
					</Pressable>
				) : isMember ? (
					<Pressable
						onPress={handleLeave}
						disabled={busy}
						style={[styles.action, styles.actionDanger, busy && styles.actionDisabled]}
						accessibilityRole="button"
						accessibilityLabel={isOwner ? 'Leave the event' : 'Quitter'}
					>
						<LogOut color="#ffb4b4" size={13} />
						<ThemedText style={styles.actionText}>{isOwner ? 'Leave' : 'Quitter'}</ThemedText>
					</Pressable>
				) : null}
			</View>

			{isPending ? (
				<View style={styles.pendingBanner}>
					<MailPlus color="#ffc46b" size={13} />
					<ThemedText style={styles.pendingText}>
						Vous avez été invité. Acceptez pour rejoindre l’événement.
					</ThemedText>
				</View>
			) : null}

			{event.canEdit && !isPending ? (
				<View style={styles.inviteRow}>
					<TextInput
						value={username}
						onChangeText={setUsername}
						placeholder="username à inviter"
						placeholderTextColor="rgba(255,255,255,0.35)"
						autoCapitalize="none"
						autoCorrect={false}
						style={styles.inviteInput}
						accessibilityLabel="Username to invite"
					/>
					<Pressable
						onPress={handleInvite}
						disabled={busy || username.trim().length === 0}
						style={[styles.action, busy && styles.actionDisabled]}
						accessibilityRole="button"
						accessibilityLabel="Inviter"
					>
						{inviteMutation.isPending ? (
							<ActivityIndicator color="#fff" size="small" />
						) : (
							<UserPlus color="#fff" size={13} />
						)}
						<ThemedText style={styles.actionText}>Inviter</ThemedText>
					</Pressable>
				</View>
			) : null}

			{error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

			{event.members.map((member) => (
				<View key={member.id} style={styles.memberRow}>
					{roleIcon(member.role)}
					<ThemedText style={styles.memberName} numberOfLines={1}>
						{member.username}
					</ThemedText>
					<View style={[styles.badge, member.status === 'PENDING' && styles.badgePending]}>
						<ThemedText style={styles.badgeText}>
							{member.status === 'PENDING' ? 'EN ATTENTE' : member.role}
						</ThemedText>
					</View>
				</View>
			))}
		</View>
	);
}
