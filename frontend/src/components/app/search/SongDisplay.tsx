import { Banana, EllipsisVertical, Heart } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { DeezerTrack } from '@/src/types/deezer/deezer';
import LiquidGlass from '../../LiquidGlass';
import { ThemedText } from '../../themed-text';

interface SongDisplayProps {
	song: DeezerTrack;
	onPress?: () => void;
	onArtistPress?: (artistId: string | number) => void;
	onAlbumPress?: (albumId: string | number) => void;
}

export function SongDisplay({
	song,
	onPress,
	onArtistPress,
	onAlbumPress,
}: SongDisplayProps) {
	return (
		<Pressable onPress={onPress} style={styles.wrapper}>
			<LiquidGlass
				style={styles.songCard}
				contentStyle={styles.songCardContent}
				intensity={10}
				radius={22}
				topLeftRadius={20}
				topRightRadius={20}
				bottomLeftRadius={20}
				bottomRightRadius={20}
			>
				<Image
					source={{ uri: song.album?.cover! }}
					resizeMode="cover"
					style={styles.songCover}
				/>

				<View style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
					<View style={styles.songInfo}>
						<View style={styles.songTitleRow}>
							<ThemedText
								style={styles.songTitle}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{song.title}
							</ThemedText>

							{song.explicit_lyrics === true && (
								<Banana
									size={14}
									color="rgba(255,255,255,0.7)"
									style={styles.explicitIcon}
								/>
							)}
						</View>

						<View style={styles.artistAlbumRow}>
							<ThemedText
								style={styles.songArtist}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{song.artist.name}
							</ThemedText>

							<View style={styles.separator} />

							<ThemedText
								style={styles.albumText}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{song.album?.title}
							</ThemedText>
						</View>
					</View>

					<View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', width: '40%', alignItems: 'center', gap: 3}}>
						<ThemedText style={styles.songDuration}>
							{formatDuration(song.duration)}
						</ThemedText>

						<Pressable
							style={styles.iconButton}
							onPress={(event) => {
								event.stopPropagation();
							}}
						>
							<Heart color="#fff" size={19} />
						</Pressable>

						<Pressable
							style={styles.iconButton}
							onPress={(event) => {
								event.stopPropagation();
							}}
							accessibilityLabel="More options"
						>
							<EllipsisVertical color="#fff" size={20} />
						</Pressable>
					</View>
				</View>
			</LiquidGlass>
		</Pressable>
	);
}

function formatDuration(duration?: string | number) {
	if (!duration) {
		return '--:--';
	}

	const totalSeconds = Number(duration);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
	wrapper: {
		width: '100%',
	},

	songCard: {
		width: '100%',
		minHeight: 74,
	},

	songCardContent: {
		width: '100%',
		minHeight: 74,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 10,
		gap: 10,
	},

	songCover: {
		width: 52,
		height: 52,
		borderRadius: 14,
		flexShrink: 0,
	},

	songInfo: {
		flex: 1,
		minWidth: 0,
		maxWidth: '40%',
		justifyContent: 'flex-start',
	},

	songTitleRow: {
		flex: 1,
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		minWidth: 0,
		marginBottom: 3,
	},

	songTitle: {
		minWidth: 0,
		color: '#fff',
		fontSize: 15,
		fontWeight: '600',
	},

	explicitIcon: {
		marginLeft: 5,
	},

	artistAlbumRow: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		minWidth: 0,
	},

	songArtist: {
		width: '40%',
		flexShrink: 0,
		color: 'rgba(255,255,255,0.72)',
		fontSize: 11,
		lineHeight: 15,
	},

	separator: {
		width: 1,
		height: 10,
		marginHorizontal: 8,
		flexShrink: 0,
		backgroundColor: 'rgba(255,255,255,0.25)',
	},

	albumText: {
		flex: 1,
		minWidth: 0,
		flexShrink: 1,
		color: 'rgba(255,255,255,0.48)',
		fontSize: 10,
		lineHeight: 13,
	},

	songDuration: {
		color: '#fff',
		fontSize: 12,
		marginLeft: 2,
	},

	iconButton: {
		width: 26,
		height: 34,
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
	},
});