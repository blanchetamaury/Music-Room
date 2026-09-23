import { DeezerAlbum } from '@/src/types/deezer/deezer';
import { Image, Pressable, View } from 'react-native';
import { HoverText } from '../ui/hoverText';
import { ThemedText } from '../utils/themed-text';
import { styles } from './AlbumDisplay.styles';

interface AlbumDisplayProps {
	album: DeezerAlbum;
	onPress?: () => void;
}

export function AlbumDisplay({ album, onPress }: AlbumDisplayProps) {
	return (
		<Pressable onPress={onPress} style={styles.container}>
			{album.coverMedium ? (
				<Image
					source={{
						uri: album.coverMedium,
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

				<ThemedText style={styles.date}>{album.releaseDate.toISOString() ?? 'Unknown date'}</ThemedText>
			</View>
		</Pressable>
	);
}
