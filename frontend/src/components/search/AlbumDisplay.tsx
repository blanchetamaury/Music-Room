import { OutputAlbumDeezer } from '@/src/types/deezer/OutputDeezerTrack';
import { Image, Pressable, View } from 'react-native';
import { HoverText } from '../ui/hoverText';
import { ThemedText } from '../utils/themed-text';
import { styles } from './AlbumDisplay.styles';

function formatReleaseDate(value: string | null | undefined): string {
	if (!value) return 'Unknown date';

	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return 'Unknown date';

	return parsed.toISOString().slice(0, 10);
}

interface AlbumDisplayProps {
	album: OutputAlbumDeezer;
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

				<ThemedText style={styles.date}>{formatReleaseDate(album.releaseDate)}</ThemedText>
			</View>
		</Pressable>
	);
}
