import { Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '../themed-text';
import { HoverText } from '../ui/hoverText';

export type DeezerAlbum = {
	id: string | number;
	title: string;
	cover_medium?: string;
	cover_big?: string;
	release_date?: string;
};

interface AlbumDisplayProps {
	album: DeezerAlbum;
	onPress?: () => void;
}

export function AlbumDisplay({ album, onPress }: AlbumDisplayProps) {
	return (
		<Pressable onPress={onPress} style={styles.container}>
			{album.cover_medium ? (
				<Image
					source={{
						uri: album.cover_medium,
					}}
					style={styles.cover}
				/>
			) : (
				<View style={styles.coverPlaceholder} />
			)}

			<View style={styles.info}>
				<HoverText style={styles.title} onPress={onPress}>
					{album.title}
				</HoverText>

				<ThemedText style={styles.date}>{album.release_date ?? 'Unknown date'}</ThemedText>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 8,
		borderRadius: 12,
	},

	cover: {
		width: 64,
		height: 64,
		borderRadius: 10,
		marginRight: 14,
	},

	coverPlaceholder: {
		width: 64,
		height: 64,
		borderRadius: 10,
		backgroundColor: 'rgba(255,255,255,0.1)',
		marginRight: 14,
	},

	info: {
		flex: 1,
		justifyContent: 'center',
	},

	title: {
		fontSize: 15,
		fontWeight: '600',
		marginBottom: 4,
		alignSelf: 'flex-start',
	},

	date: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.5)',
	},
});
