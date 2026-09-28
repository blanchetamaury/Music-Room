import { Check, Globe, LockKeyhole, Trash2, UserMinus, Users, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import {
	useDeletePlaylistMutation,
	useInvitePlaylistMemberMutation,
	usePlaylistMembersQuery,
	usePlaylistQuery,
	useRemovePlaylistMemberMutation,
	useUpdatePlaylistMutation,
} from '@/src/lib/fetcher/tanstack/user';
import { ThemedText } from '../utils/themed-text';
import { InputForm } from '../utils/InputForm';
import { styles } from './PlaylistCreate.styles';
import type { PlaylistEditPolicy, PlaylistOutput, PlaylistVisibility } from '@/src/types/playlist/PlaylistOutput';

interface PlaylistEditProps {
	id: string;
	setPopup: (value: null) => void;
}

export function PlaylistEdit({ id, setPopup }: PlaylistEditProps) {
	const { token } = useAuth();
	const { data: playlist, isLoading } = usePlaylistQuery(token, id);

	if (isLoading || !playlist) {
		return (
			<View style={styles.stateContainer}>
				<ActivityIndicator color="#fff" />
				<ThemedText style={styles.placeholderText}>Loading playlist...</ThemedText>
			</View>
		);
	}

	return <PlaylistEditForm playlist={playlist} playlistId={id} setPopup={setPopup} />;
}

function PlaylistEditForm({
	playlist,
	playlistId,
	setPopup,
}: {
	playlist: PlaylistOutput;
	playlistId: string;
	setPopup: (value: null) => void;
}) {
	const { token, user } = useAuth();
	const { data: membersData } = usePlaylistMembersQuery(token, playlistId);
	const updateMutation = useUpdatePlaylistMutation();
	const deleteMutation = useDeletePlaylistMutation();
	const inviteMutation = useInvitePlaylistMemberMutation();
	const removeMemberMutation = useRemovePlaylistMemberMutation();

	const [name, setName] = useState(playlist.name);
	const [cover, setCover] = useState(playlist.cover ?? '');
	const [visibility, setVisibility] = useState<PlaylistVisibility>(playlist.visibility);
	const [editPolicy, setEditPolicy] = useState<PlaylistEditPolicy>(playlist.editPolicy);
	const [inviteUsername, setInviteUsername] = useState('');
	const [inviteRole, setInviteRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR');

	const isOwner = playlist.ownerId === user?.id;
	const members = membersData?.members ?? [];
	const errorMessage =
		updateMutation.error ?? deleteMutation.error ?? inviteMutation.error ?? removeMemberMutation.error;

	const handleSave = () => {
		const trimmedName = name.trim();
		if (!token || !trimmedName) return;

		updateMutation.mutate(
			{
				token,
				playlistId,
				data: {
					name: trimmedName,
					cover: cover.trim() || null,
					visibility,
					editPolicy,
					expectedVersion: playlist?.version,
				},
			},
			{ onSuccess: () => setPopup(null) }
		);
	};

	const handleDelete = () => {
		if (!token) return;
		deleteMutation.mutate({ token, playlistId }, { onSuccess: () => setPopup(null) });
	};

	const handleInvite = () => {
		if (!token) return;
		const username = inviteUsername.trim();
		if (!username) return;

		inviteMutation.mutate(
			{ token, playlistId, username, role: inviteRole },
			{ onSuccess: () => setInviteUsername('') }
		);
	};

	const handleRemoveMember = (userId: string) => {
		if (!token) return;
		removeMemberMutation.mutate({ token, playlistId, userId });
	};

	return (
		<ScrollView contentContainerStyle={styles.editContainer} keyboardShouldPersistTaps="handled">
			<ThemedText style={styles.editTitle}>Edit playlist</ThemedText>

			<InputForm
				isEmail={false}
				placeholder="Playlist name"
				inputValue={name}
				setInputValue={setName}
				style={styles.inputForm}
			/>
			<InputForm
				isEmail={false}
				placeholder="Cover URL"
				inputValue={cover}
				setInputValue={setCover}
				style={styles.inputForm}
			/>

			<Pressable
				style={[styles.chip, visibility === 'PUBLIC' && styles.chipActive]}
				onPress={() => setVisibility((value) => (value === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC'))}
				accessibilityRole="button"
				accessibilityLabel="Toggle playlist visibility"
			>
				{visibility === 'PUBLIC' ? (
					<Globe color="#ffffff" size={16} />
				) : (
					<LockKeyhole color="#ffffff" size={16} />
				)}
				<ThemedText style={styles.chipValue}>
					{visibility === 'PUBLIC' ? 'Public playlist' : 'Private playlist'}
				</ThemedText>
			</Pressable>

			<Pressable
				style={[styles.chip, editPolicy === 'EVERYONE' && styles.chipActive]}
				onPress={() => setEditPolicy((value) => (value === 'EVERYONE' ? 'INVITED_ONLY' : 'EVERYONE'))}
				accessibilityRole="button"
				accessibilityLabel="Toggle who can edit this playlist"
			>
				<Users color="#ffffff" size={16} />
				<ThemedText style={styles.chipValue}>
					{editPolicy === 'EVERYONE' ? 'Anyone can edit' : 'Invited members only'}
				</ThemedText>
			</Pressable>

			{isOwner && (
				<View style={styles.section}>
					<ThemedText style={styles.sectionTitle}>Collaborators</ThemedText>

					{members.map((member) => (
						<View key={member.id} style={styles.memberRow}>
							<View style={styles.memberInfo}>
								<ThemedText numberOfLines={1} style={styles.memberName}>
									{member.username}
								</ThemedText>
								<ThemedText style={styles.memberRole}>
									{member.role === 'OWNER'
										? 'Owner'
										: member.role === 'EDITOR'
											? 'Can edit'
											: 'Can listen'}
								</ThemedText>
							</View>

							{member.role !== 'OWNER' && (
								<Pressable
									style={styles.iconButton}
									onPress={() => handleRemoveMember(member.id)}
									disabled={removeMemberMutation.isPending}
									accessibilityRole="button"
									accessibilityLabel={`Remove ${member.username}`}
								>
									<UserMinus color="#ffb0b0" size={16} />
								</Pressable>
							)}
						</View>
					))}

					{members.length === 0 && <ThemedText style={styles.mutedText}>No collaborators yet.</ThemedText>}

					<View style={styles.inlineRow}>
						<View style={[styles.form, { flex: 1 }]}>
							<InputForm
								isEmail={false}
								placeholder="Username to invite"
								inputValue={inviteUsername}
								setInputValue={setInviteUsername}
								style={styles.inputForm}
							/>
						</View>

						<Pressable
							style={styles.chip}
							onPress={() => setInviteRole((value) => (value === 'EDITOR' ? 'VIEWER' : 'EDITOR'))}
							accessibilityRole="button"
							accessibilityLabel="Toggle invite role"
						>
							<ThemedText style={styles.chipValue}>
								{inviteRole === 'EDITOR' ? 'Editor' : 'Listener'}
							</ThemedText>
						</Pressable>
					</View>

					<Pressable
						style={[
							styles.secondaryButton,
							(!inviteUsername.trim() || inviteMutation.isPending) && { opacity: 0.5 },
						]}
						onPress={handleInvite}
						disabled={!inviteUsername.trim() || inviteMutation.isPending}
						accessibilityRole="button"
					>
						{inviteMutation.isPending ? (
							<ActivityIndicator color="#fff" size="small" />
						) : (
							<ThemedText style={styles.cancelText}>Invite</ThemedText>
						)}
					</Pressable>
				</View>
			)}

			{errorMessage && <ThemedText style={styles.errorText}>{errorMessage.message}</ThemedText>}

			<View style={styles.editActions}>
				<Pressable style={styles.cancelButton} onPress={() => setPopup(null)}>
					<X color="#fff" size={16} />
				</Pressable>

				{isOwner && (
					<Pressable
						style={styles.deleteButton}
						onPress={handleDelete}
						disabled={deleteMutation.isPending}
						accessibilityRole="button"
					>
						<Trash2 color="#ffb0b0" size={16} />
					</Pressable>
				)}

				<Pressable
					style={[styles.addButton, updateMutation.isPending && { opacity: 0.5 }]}
					onPress={handleSave}
					disabled={updateMutation.isPending}
					accessibilityRole="button"
				>
					{updateMutation.isPending ? (
						<ActivityIndicator color="#000" size="small" />
					) : (
						<>
							<Check color="#000" size={16} />
							<ThemedText style={styles.addText}>Save</ThemedText>
						</>
					)}
				</Pressable>
			</View>
		</ScrollView>
	);
}
