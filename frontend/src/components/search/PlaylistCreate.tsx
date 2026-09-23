import { Eye, EyeClosed } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useCreatePlaylistMutation } from '@/src/lib/fetcher/tanstack/user';
import { ThemedText } from '../utils/themed-text';
import { InputForm } from '../utils/InputForm';
import { styles } from './PlaylistCreate.styles';

interface PlaylistProfileMobileProps {
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

export function PlaylistCreate({ setPopup }: PlaylistProfileMobileProps) {
	const [playlistName, setPlaylistName] = useState('');
	const [playlistDescription, setPlaylistDescription] = useState('');
	const [urlImage, setUrlImage] = useState('');
	const [visibilityPlaylist, setVisibilityPlaylist] = useState(false);
	const createPlaylistMutation = useCreatePlaylistMutation();
	const { token } = useAuth();

	const handleAddPlaylist = () => {
		createPlaylistMutation.mutate({
			name: playlistName,
			cover: urlImage,
			description: playlistDescription,
			privatePlaylist: visibilityPlaylist,
			token: token ?? '',
		});

		setPopup(null);
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

				<View style={[styles.visibility, debugBox('#0088ff')]}>
					<ThemedText style={styles.visibilityText}>{visibilityPlaylist ? 'Public' : 'Private'}</ThemedText>

					<Pressable
						style={[
							styles.visibilityButton,
							visibilityPlaylist && styles.visibilityButtonActive,
							debugBox('#ff00ff'),
						]}
						onPress={() => setVisibilityPlaylist(!visibilityPlaylist)}
					>
						{visibilityPlaylist ? (
							<Eye size={20} color="#ffffff" />
						) : (
							<EyeClosed size={20} color="#ffffff" />
						)}
					</Pressable>
				</View>

				<Pressable style={[styles.addButton, debugBox('#00ff88')]} onPress={handleAddPlaylist}>
					<ThemedText style={styles.addText}>ADD</ThemedText>
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
			</View>
		</View>
	);
}
