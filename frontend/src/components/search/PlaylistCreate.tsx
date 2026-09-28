import { Eye, EyeClosed, Globe, LockKeyhole, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, View } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useCreatePlaylistMutation } from '@/src/lib/fetcher/tanstack/user';
import { ThemedText } from '../utils/themed-text';
import { InputForm } from '../utils/InputForm';
import { styles } from './PlaylistCreate.styles';
import type { PlaylistEditPolicy, PlaylistVisibility } from '@/src/types/playlist/PlaylistOutput';

interface PlaylistCreateProps {
	setPopup: (value: null) => void;
}

const DEBUG = false;

const debugBox = (color: string) => {
	if (!DEBUG) {
		return {};
	}

	return {
		borderWidth: 2,
		borderColor: color,
		backgroundColor: `${color}22`,
	};
};

export function PlaylistCreate({ setPopup }: PlaylistCreateProps) {
	const [playlistName, setPlaylistName] = useState('');
	const [playlistDescription, setPlaylistDescription] = useState('');
	const [urlImage, setUrlImage] = useState('');
	const [visibility, setVisibility] = useState<PlaylistVisibility>('PUBLIC');
	const [editPolicy, setEditPolicy] = useState<PlaylistEditPolicy>('EVERYONE');
	const createPlaylistMutation = useCreatePlaylistMutation();
	const { token } = useAuth();

	const canSubmit = playlistName.trim().length > 0 && Boolean(token) && !createPlaylistMutation.isPending;

	const toggleVisibility = () => setVisibility((value) => (value === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC'));

	const handleAddPlaylist = () => {
		if (!token || !canSubmit) return;

		createPlaylistMutation.mutate(
			{
				token,
				name: playlistName.trim(),
				cover: urlImage.trim() || null,
				description: playlistDescription.trim() || undefined,
				visibility,
				editPolicy,
			},
			{ onSuccess: () => setPopup(null) }
		);
	};

	return (
		<View style={[styles.container, debugBox('#ff0000')]}>
			<View style={[styles.leftColumn, debugBox('#ff8800')]}>
				<View style={[styles.imageContainer, debugBox('#00ffff')]}>
					{urlImage ? (
						<Image source={{ uri: urlImage }} resizeMode="cover" style={styles.image} />
					) : (
						<View style={styles.imagePlaceholder}>
							<ThemedText style={styles.placeholderText}>No image</ThemedText>
						</View>
					)}
				</View>

				<Pressable
					style={[styles.visibility, debugBox('#0088ff')]}
					onPress={toggleVisibility}
					accessibilityRole="button"
					accessibilityLabel="Toggle playlist visibility"
				>
					<ThemedText style={styles.visibilityText}>
						{visibility === 'PUBLIC' ? 'Public' : 'Private'}
					</ThemedText>

					<Pressable
						style={[styles.visibilityButton, visibility === 'PUBLIC' && styles.visibilityButtonActive]}
						onPress={toggleVisibility}
						accessibilityRole="button"
					>
						{visibility === 'PUBLIC' ? (
							<Eye size={20} color="#ffffff" />
						) : (
							<EyeClosed size={20} color="#ffffff" />
						)}
					</Pressable>
				</Pressable>

				<Pressable
					style={[styles.chip, editPolicy === 'EVERYONE' && styles.chipActive, debugBox('#ff00ff')]}
					onPress={() => setEditPolicy((value) => (value === 'EVERYONE' ? 'INVITED_ONLY' : 'EVERYONE'))}
					accessibilityRole="button"
					accessibilityLabel="Toggle who can edit"
				>
					<ThemedText style={styles.chipLabel}>
						{editPolicy === 'EVERYONE' ? (
							<Globe color="rgba(255,255,255,0.7)" size={14} />
						) : (
							<Users color="rgba(255,255,255,0.7)" size={14} />
						)}
					</ThemedText>
					<ThemedText style={styles.chipValue}>
						{editPolicy === 'EVERYONE' ? 'Anyone can edit' : 'Invited only'}
					</ThemedText>
				</Pressable>

				<Pressable
					style={[styles.addButton, !canSubmit && { opacity: 0.5 }, debugBox('#00ff88')]}
					onPress={handleAddPlaylist}
					disabled={!canSubmit}
					accessibilityRole="button"
				>
					{createPlaylistMutation.isPending ? (
						<ActivityIndicator color="#000" size="small" />
					) : (
						<ThemedText style={styles.addText}>ADD</ThemedText>
					)}
				</Pressable>
			</View>

			<View style={[styles.form, debugBox('#00ff00')]}>
				<InputForm
					isEmail={false}
					placeholder="Playlist name"
					inputValue={playlistName}
					setInputValue={setPlaylistName}
					style={styles.inputForm}
				/>

				<InputForm
					isEmail={false}
					placeholder="Description"
					inputValue={playlistDescription}
					setInputValue={setPlaylistDescription}
					style={styles.inputForm}
				/>

				<InputForm
					isEmail={false}
					placeholder="Image Url"
					inputValue={urlImage}
					setInputValue={setUrlImage}
					style={styles.inputForm}
				/>

				<ThemedText style={styles.mutedText}>
					{visibility === 'PRIVATE' ? (
						<LockKeyhole color="rgba(255,255,255,0.5)" size={12} />
					) : (
						<Globe color="rgba(255,255,255,0.5)" size={12} />
					)}{' '}
					{visibility === 'PRIVATE'
						? 'Only you and the invited members can see it.'
						: 'Anyone can listen, editing depends on the policy above.'}
				</ThemedText>
			</View>
		</View>
	);
}
