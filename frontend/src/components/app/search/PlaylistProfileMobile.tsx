import {
	Eye,
	EyeClosed,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
	Image,
	Pressable,
	StyleSheet,
	View,
} from 'react-native';

import { InputForm } from '../../InputForm';
import LiquidGlass from '../../LiquidGlass';
import { ThemedText } from '../../themed-text';

interface PlaylistProfileMobileProps {
	addPlaylistToDb: (
		name: string,
		description: string,
		imageUrl: string,
		visibility: boolean,
	) => void;
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

export function PlaylistProfileMobile({
	addPlaylistToDb,
	setPopup,
}: PlaylistProfileMobileProps) {
	const [playlistName, setPlaylistName] =
		useState('');
	const [playlistDescription, setPlaylistDescription] =
		useState('');
	const [urlImage, setUrlImage] = useState('');
	const [visibilityPlaylist, setVisibilityPlaylist] =
		useState(false);

	const handleAddPlaylist = () => {
		addPlaylistToDb(
			playlistName,
			playlistDescription,
			urlImage,
			visibilityPlaylist,
		);

		setPopup(null);
	};

	return (
		<View
			style={[
				styles.container,
				debugBox('#ff0000'),
			]}
		>
			<View
				style={[
					styles.leftColumn,
					debugBox('#ff8800'),
				]}
			>
				<View
					style={[
						styles.imageContainer,
						debugBox('#00ffff'),
					]}
				>
					{urlImage ? (
						<Image
							source={{ uri: urlImage }}
							resizeMode="cover"
							style={styles.image}
						/>
					) : (
						<View
							style={
								styles.imagePlaceholder
							}
						>
							<ThemedText
								style={
									styles.placeholderText
								}
							>
								No image
							</ThemedText>
						</View>
					)}
				</View>

				<View
					style={[
						styles.visibility,
						debugBox('#0088ff'),
					]}
				>
					<ThemedText
						style={styles.visibilityText}
					>
						{visibilityPlaylist
							? 'Public'
							: 'Private'}
					</ThemedText>

					<Pressable
						style={[
							styles.visibilityButton,
							visibilityPlaylist &&
								styles.visibilityButtonActive,
							debugBox('#ff00ff'),
						]}
						onPress={() =>
							setVisibilityPlaylist(
								!visibilityPlaylist,
							)
						}
					>
						{visibilityPlaylist ? (
							<Eye
								size={20}
								color="#ffffff"
							/>
						) : (
							<EyeClosed
								size={20}
								color="#ffffff"
							/>
						)}
					</Pressable>
				</View>

				<Pressable
					style={[
						styles.addButton,
						debugBox('#00ff88'),
					]}
					onPress={handleAddPlaylist}
				>
					<ThemedText
						style={styles.addText}
					>
						ADD
					</ThemedText>
				</Pressable>
			</View>

			<View
				style={[
					styles.form,
					debugBox('#00ff00'),
				]}
			>
				<LiquidGlass
					style={[
						styles.inputGlass,
						debugBox('#ffff00'),
					]}
					contentStyle={styles.inputGlassContent}
					intensity={45}
					radius={12}
					topLeftRadius={12}
					topRightRadius={12}
					bottomLeftRadius={12}
					bottomRightRadius={12}
				>
					<InputForm
						isEmail={false}
						placeholder="Playlist name"
						inputValue={playlistName}
						setInputValue={setPlaylistName}
					/>
				</LiquidGlass>

				<LiquidGlass
					style={[
						styles.inputGlass,
						debugBox('#ff00ff'),
					]}
					contentStyle={styles.inputGlassContent}
					intensity={45}
					radius={12}
					topLeftRadius={12}
					topRightRadius={12}
					bottomLeftRadius={12}
					bottomRightRadius={12}
				>
					<InputForm
						isEmail={false}
						placeholder="Description"
						inputValue={playlistDescription}
						setInputValue={
							setPlaylistDescription
						}
					/>
				</LiquidGlass>

				<LiquidGlass
					style={[
						styles.inputGlass,
						debugBox('#00ffff'),
					]}
					contentStyle={styles.inputGlassContent}
					intensity={45}
					radius={12}
					topLeftRadius={12}
					topRightRadius={12}
					bottomLeftRadius={12}
					bottomRightRadius={12}
				>
					<InputForm
						isEmail={false}
						placeholder="Image Url"
						inputValue={urlImage}
						setInputValue={setUrlImage}
					/>
				</LiquidGlass>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		padding: 20,
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 25,
		minWidth: 0,
	},

	leftColumn: {
		width: 128,
		flexShrink: 0,
		alignItems: 'stretch',
		gap: 12,
	},

	imageContainer: {
		width: 128,
		height: 128,
		borderRadius: 16,
		overflow: 'hidden',
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.12)',
	},

	image: {
		width: '100%',
		height: '100%',
	},

	imagePlaceholder: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.05)',
	},

	placeholderText: {
		fontSize: 12,
		color: 'rgba(255,255,255,0.35)',
	},

	visibility: {
		width: '100%',
		minHeight: 38,
		paddingHorizontal: 10,
		borderRadius: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: 'rgba(255,255,255,0.06)',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.1)',
	},

	visibilityText: {
		fontSize: 12,
		fontWeight: '600',
		color: 'rgba(255,255,255,0.7)',
	},

	visibilityButton: {
		width: 28,
		height: 28,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.08)',
	},

	visibilityButtonActive: {
		backgroundColor: 'rgba(255,255,255,0.14)',
	},

	form: {
		flex: 1,
		minWidth: 0,
		flexShrink: 1,
		gap: 10,
	},

	inputGlass: {
		width: '100%',
		minWidth: 0,
	},

	inputGlassContent: {
		width: '100%',
		paddingHorizontal: 4,
		paddingVertical: 2,
	},

	addButton: {
		width: '100%',
		minHeight: 38,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#ffffff',
	},

	addText: {
		fontSize: 13,
		fontWeight: '700',
		color: '#000000',
	},
});