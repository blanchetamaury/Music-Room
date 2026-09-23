import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { usePlaylistQuery, useUpdatePlaylistMutation } from '@/src/lib/fetcher/tanstack/user';
import { ThemedText } from '../utils/themed-text';
import { InputForm } from '../utils/InputForm';
import { styles } from './PlaylistCreate.styles';

interface PlaylistEditProps {
	id: string;
	setPopup: (value: null) => void;
}

export function PlaylistEdit({ id, setPopup }: PlaylistEditProps) {
	const { token } = useAuth();
	const { data: playlist, isLoading } = usePlaylistQuery(token, id);
	const updateMutation = useUpdatePlaylistMutation();
	const [name, setName] = useState('');
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		if (playlist && !initialized) {
			setName(playlist.name);
			setInitialized(true);
		}
	}, [initialized, playlist]);

	const handleSave = () => {
		const trimmedName = name.trim();
		if (!token || !trimmedName) return;

		updateMutation.mutate({ token, playlistId: id, name: trimmedName }, { onSuccess: () => setPopup(null) });
	};

	if (isLoading || !playlist) {
		return (
			<View style={styles.stateContainer}>
				<ActivityIndicator color="#fff" />
				<ThemedText style={styles.placeholderText}>Loading playlist...</ThemedText>
			</View>
		);
	}

	return (
		<View style={styles.editContainer}>
			<ThemedText style={styles.editTitle}>Edit playlist</ThemedText>
			<InputForm
				isEmail={false}
				placeholder="Playlist name"
				inputValue={name}
				setInputValue={setName}
				style={styles.inputForm}
			/>
			<View style={styles.editActions}>
				<Pressable style={styles.cancelButton} onPress={() => setPopup(null)}>
					<ThemedText style={styles.cancelText}>Cancel</ThemedText>
				</Pressable>
				<Pressable style={styles.addButton} onPress={handleSave} disabled={updateMutation.isPending}>
					{updateMutation.isPending ? (
						<ActivityIndicator color="#000" />
					) : (
						<ThemedText style={styles.addText}>Save</ThemedText>
					)}
				</Pressable>
			</View>
		</View>
	);
}
