import { Banana, EllipsisVertical, Heart } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { DeezerTrack } from '@/src/lib/api/client';
import LiquidGlass from '../../LiquidGlass';
import { ThemedText } from '../../themed-text';
import { HoverText } from '../../ui/hoverText';

interface SongDisplayProps {
	song: DeezerTrack;

	onPress?: () => void;

	onArtistPress?: (artistId: string | number) => void;

	onAlbumPress?: (albumId: string | number) => void;
}

export function SongDisplay({ song, onPress, onArtistPress, onAlbumPress }: SongDisplayProps) {
	return (
		<Pressable onPress={onPress}>
			<LiquidGlass
				style={style.songCard}
				contentStyle={style.songCardContent}
				intensity={30}
				radius={20}
				topLeftRadius={20}
				topRightRadius={20}
				bottomLeftRadius={20}
				bottomRightRadius={20}
			>
				<Image
					source={{
						uri: song.album.cover_medium,
					}}
					resizeMode="cover"
					style={style.songCover}
				/>

				<View style={style.songInfo}>
					<View style={style.songTitleRow}>
						<ThemedText style={style.songTitle}>{song.title}</ThemedText>

						{song.explicit_lyrics === true && <Banana size={15} color="rgba(255,255,255,0.7)" />}
					</View>

					<HoverText
						style={style.songArtist}
						onPress={(event) => {
							event.stopPropagation();

							onArtistPress?.(song.artist.id);
						}}
					>
						{song.artist.name}
					</HoverText>
				</View>

				<View style={style.songAlbum}>
					<HoverText
						onPress={(event) => {
							event.stopPropagation();

							onAlbumPress?.(song.album.id);
						}}
					>
						{song.album.title}
					</HoverText>
				</View>

				<ThemedText style={style.songDuration}>{formatDuration(song.duration)}</ThemedText>

				<Pressable>
					<Heart color={"#ffff"}></Heart>
				</Pressable>

				<Pressable
					onPress={(event) => {
						event.stopPropagation();

						console.log('More options:', song.title);
					}}
					accessibilityLabel="More options"
				>
					<EllipsisVertical color="#fff" />
				</Pressable>
			</LiquidGlass>
		</Pressable>
	);
}

function formatDuration(duration?: string | number) {
	if (!duration) {
		return '--:--';
	}

	const minutes = Math.floor(Number(duration) / 60);
	const seconds = Number(duration) % 60;

	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const style = StyleSheet.create({
	songCard: {
		borderRadius: 20,
		minHeight: 74,
	},

	songCardContent: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 10,
	},

	songCover: {
		width: 52,
		height: 52,
		borderRadius: 14,
		marginRight: 12,
	},

	songInfo: {
		flex: 1,
		justifyContent: 'center',
	},

	songTitle: {
		color: '#fff',
		fontSize: 14,
		fontWeight: '600',
	},

	songTitleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		marginBottom: 2,
	},

	songArtist: {
		color: 'rgba(255,255,255,0.72)',
		fontSize: 11,
	},

	songAlbum: {
		flex: 1,
		justifyContent: 'center',
	},

	songDuration: {
		color: '#fff',
		fontSize: 14,
		marginRight: 12,
	},
});
