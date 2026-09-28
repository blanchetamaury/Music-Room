import { useAuth } from '@/src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Check, LogOut, Pencil, Plus, UserMinus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { DevicesPanel } from '../devices/DevicesPanel';
import { ThemedText } from '../utils/themed-text';
import { styles } from './ProfileScreen.styles';

const initialFriends = [
	{ id: '1', name: 'Alex', status: 'En ligne' },
	{ id: '2', name: 'Sam', status: 'Écoute un titre' },
	{ id: '3', name: 'Nora', status: 'Hors ligne' },
];

type EditField = 'username' | 'avatarUrl' | null;

export function ProfileScreen() {
	const { user, updateProfile, logout } = useAuth();
	const [friends, setFriends] = useState(initialFriends);
	const [friendName, setFriendName] = useState('');
	const [bio] = useState('Toujours à la recherche du prochain morceau parfait.');
	const [listeningStyle, setListeningStyle] = useState('Écoute éclectique');
	const [profileStatus, setProfileStatus] = useState('Disponible');
	const [weeklyPlays, setWeeklyPlays] = useState(24);
	const [editField, setEditField] = useState<EditField>(null);
	const [draftValue, setDraftValue] = useState('');
	const [saving, setSaving] = useState(false);

	const initial = user?.username?.charAt(0).toUpperCase() ?? '?';

	const openEditor = (field: EditField) => {
		setEditField(field);
		setDraftValue(field === 'username' ? (user?.username ?? '') : (user?.avatarUrl ?? ''));
	};

	const saveEditor = async () => {
		if (!editField || !draftValue.trim()) return;
		setSaving(true);
		try {
			await updateProfile(
				editField === 'username' ? { username: draftValue.trim() } : { avatarUrl: draftValue.trim() }
			);
			setEditField(null);
		} finally {
			setSaving(false);
		}
	};

	const addFriend = () => {
		const name = friendName.trim();
		if (!name) return;
		setFriends((current) => [...current, { id: `${Date.now()}`, name, status: 'Invitation envoyée' }]);
		setFriendName('');
	};

	return (
		<ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
			<View style={styles.profileCard}>
				<LinearGradient
					colors={['rgba(180,77,255,0.22)', 'rgba(62,207,255,0.05)', 'transparent']}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={styles.profileGradient}
				/>
				<View style={styles.profileHeader}>
					<Pressable
						onPress={() => openEditor('avatarUrl')}
						style={styles.avatarButton}
						accessibilityLabel="Changer la photo de profil"
					>
						{user?.avatarUrl ? (
							<Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
						) : (
							<View style={[styles.avatar, styles.avatarFallback]}>
								<ThemedText style={styles.initial}>{initial}</ThemedText>
							</View>
						)}
						<View style={styles.cameraBadge}>
							<Camera color="#fff" size={14} />
						</View>
					</Pressable>
					<View style={styles.profileInfo}>
						<View style={styles.nameRow}>
							<ThemedText style={styles.title} numberOfLines={1}>
								{user?.username ?? 'Profil'}
							</ThemedText>
							<Pressable
								onPress={() => openEditor('username')}
								style={styles.editIcon}
								accessibilityLabel="Modifier le pseudo"
							>
								<Pencil color="#3ECFFF" size={16} />
							</Pressable>
						</View>
						<ThemedText style={styles.email} numberOfLines={1}>
							{user?.email ?? 'Aucun email'}
						</ThemedText>
					</View>
				</View>
				<View style={styles.divider} />
				<ThemedText style={styles.bio}>{bio}</ThemedText>
				<View style={styles.chipRow}>
					{['Disponible', 'En pause', 'Invisible'].map((status) => (
						<Pressable
							key={status}
							onPress={() => setProfileStatus(status)}
							style={[styles.chip, profileStatus === status && styles.chipActive]}
						>
							<ThemedText style={[styles.chipText, profileStatus === status && styles.chipTextActive]}>
								{status}
							</ThemedText>
						</Pressable>
					))}
				</View>
			</View>

			<View style={styles.statsGrid}>
				<View style={styles.statCard}>
					<ThemedText style={styles.statValue}>{weeklyPlays}</ThemedText>
					<ThemedText style={styles.statLabel}>écoutes / semaine</ThemedText>
				</View>
				<View style={styles.statCard}>
					<ThemedText style={styles.statValue}>{friends.length}</ThemedText>
					<ThemedText style={styles.statLabel}>amis</ThemedText>
				</View>
				<View style={styles.statCard}>
					<ThemedText style={styles.statValue}>{profileStatus}</ThemedText>
					<ThemedText style={styles.statLabel}>statut</ThemedText>
				</View>
			</View>

			<View style={styles.section}>
				<View style={styles.sectionHeading}>
					<ThemedText style={styles.sectionTitle}>Style d’écoute</ThemedText>
					<ThemedText style={styles.sectionHint}>modifiable</ThemedText>
				</View>
				<View style={styles.styleRow}>
					{['Écoute éclectique', 'Chill', 'Découverte'].map((style) => (
						<Pressable
							key={style}
							onPress={() => setListeningStyle(style)}
							style={[styles.styleOption, listeningStyle === style && styles.styleOptionActive]}
						>
							<ThemedText style={styles.styleText}>{style}</ThemedText>
						</Pressable>
					))}
				</View>
				<View style={styles.stepper}>
					<ThemedText style={styles.muted}>Écoutes hebdomadaires</ThemedText>
					<View style={styles.stepperControls}>
						<Pressable
							onPress={() => setWeeklyPlays((value) => Math.max(0, value - 1))}
							style={styles.stepperButton}
						>
							<ThemedText style={styles.stepperText}>−</ThemedText>
						</Pressable>
						<ThemedText style={styles.stepperValue}>{weeklyPlays}</ThemedText>
						<Pressable onPress={() => setWeeklyPlays((value) => value + 1)} style={styles.stepperButton}>
							<ThemedText style={styles.stepperText}>+</ThemedText>
						</Pressable>
					</View>
				</View>
			</View>

			<View style={styles.section}>
				<DevicesPanel />
			</View>

			<View style={styles.section}>
				<View style={styles.sectionHeading}>
					<ThemedText style={styles.sectionTitle}>Amis</ThemedText>
					<ThemedText style={styles.sectionHint}>{friends.length} contacts</ThemedText>
				</View>
				<View style={styles.addFriendRow}>
					<TextInput
						value={friendName}
						onChangeText={setFriendName}
						placeholder="Pseudo de votre ami"
						placeholderTextColor="rgba(255,255,255,0.35)"
						style={styles.friendInput}
						onSubmitEditing={addFriend}
					/>
					<Pressable onPress={addFriend} style={styles.addButton} accessibilityLabel="Ajouter un ami">
						<Plus color="#071018" size={18} />
					</Pressable>
				</View>
				{friends.map((friend) => (
					<View key={friend.id} style={styles.friendRow}>
						<View style={styles.friendAvatar}>
							<ThemedText style={styles.friendInitial}>{friend.name.charAt(0)}</ThemedText>
						</View>
						<View style={styles.friendInfo}>
							<ThemedText style={styles.friendName}>{friend.name}</ThemedText>
							<ThemedText style={styles.friendStatus}>{friend.status}</ThemedText>
						</View>
						<Pressable
							onPress={() => setFriends((current) => current.filter((item) => item.id !== friend.id))}
							accessibilityLabel={`Retirer ${friend.name}`}
						>
							<UserMinus color="rgba(255,255,255,0.45)" size={17} />
						</Pressable>
					</View>
				))}
			</View>

			<Pressable style={styles.logoutButton} onPress={logout}>
				<LogOut color="#ffb0b0" size={18} />
				<ThemedText style={styles.logoutText}>Se déconnecter</ThemedText>
			</Pressable>

			<Modal
				visible={editField !== null}
				transparent
				animationType="fade"
				onRequestClose={() => setEditField(null)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalCard}>
						<View style={styles.modalHeader}>
							<ThemedText style={styles.modalTitle}>
								{editField === 'username' ? 'Modifier le pseudo' : 'Changer la photo'}
							</ThemedText>
							<Pressable onPress={() => setEditField(null)}>
								<X color="#fff" size={20} />
							</Pressable>
						</View>
						<TextInput
							autoFocus
							value={draftValue}
							onChangeText={setDraftValue}
							placeholder={editField === 'username' ? 'Nouveau pseudo' : 'URL de la photo'}
							placeholderTextColor="rgba(255,255,255,0.4)"
							style={styles.modalInput}
							autoCapitalize="none"
						/>
						<Pressable onPress={saveEditor} disabled={saving} style={styles.saveButton}>
							<Check color="#071018" size={17} />
							<ThemedText style={styles.saveText}>
								{saving ? 'Enregistrement...' : 'Enregistrer'}
							</ThemedText>
						</Pressable>
					</View>
				</View>
			</Modal>
		</ScrollView>
	);
}
