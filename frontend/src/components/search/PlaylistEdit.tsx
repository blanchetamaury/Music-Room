import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import {
	useDeletePlaylistMutation,
	usePlaylistQuery,
	useUpdatePlaylistDetailsMutation,
} from '@/src/lib/fetcher/tanstack/user';
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
	const updateMutation = useUpdatePlaylistDetailsMutation();
	const deleteMutation = useDeletePlaylistMutation();
	const [name, setName] = useState('');
	const [cover, setCover] = useState('');
	const [isPrivate, setIsPrivate] = useState(true);
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		if (playlist && !initialized) {
			const timer = setTimeout(() => {
				setName(playlist.name);
				setCover(playlist.cover ?? '');
				setIsPrivate(playlist.private);
				setInitialized(true);
			}, 0);
			return () => clearTimeout(timer);
		}
	}, [initialized, playlist]);

	const handleSave = () => {
		const trimmedName = name.trim();
		if (!token || !trimmedName) return;

		updateMutation.mutate(
			{ token, playlistId: id, data: { name: trimmedName, cover, private: isPrivate } },
			{ onSuccess: () => setPopup(null) }
		);
	};

	const handleDelete = () => {
		if (!token) return;
		deleteMutation.mutate({ token, playlistId: id }, { onSuccess: () => setPopup(null) });
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
			<InputForm
				isEmail={false}
				placeholder="Cover URL"
				inputValue={cover}
				setInputValue={setCover}
				style={styles.inputForm}
			/>
			<Pressable style={styles.visibilityButton} onPress={() => setIsPrivate((value) => !value)}>
				<ThemedText style={styles.cancelText}>{isPrivate ? 'Private playlist' : 'Public playlist'}</ThemedText>
			</Pressable>
			<View style={styles.editActions}>
				<Pressable style={styles.deleteButton} onPress={handleDelete} disabled={deleteMutation.isPending}>
					<ThemedText style={styles.deleteText}>Delete</ThemedText>
				</Pressable>
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
