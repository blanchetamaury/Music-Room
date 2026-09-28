import { Image, Pressable, ScrollView, View } from 'react-native';
import { ThemedText } from '../utils/themed-text';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { PlaylistDisplay, PlaylistDisplayAdd } from './PlaylistDisplay';
import { PlaylistOutput } from '@/src/types/playlist/PlaylistOutput';
import { Like } from '@/src/types/user/like';
import { Heart, MoreVertical, Music2 } from 'lucide-react-native';
import { styles } from './PlaylistList.styles';
import { PopupState } from '@/src/app/(tabs)/search';
import LiquidGlass from '../utils/LiquidGlass';

interface PlaylistListProps {
	setPopup: (value: PopupState) => void;
	likesData: Like[] | undefined;
	playlists: PlaylistOutput[] | undefined;
}

export default function PlaylistList(props: PlaylistListProps) {
	const playlists = [...(props.playlists ?? [])].sort((left, right) => right.tracks.length - left.tracks.length);

	return (
		<LiquidGlass
			style={[styles.playlistContainer]}
			contentStyle={[styles.playlistContent]}
			intensity={10}
			radius={8}
			topLeftRadius={8}
			topRightRadius={8}
			bottomLeftRadius={8}
			bottomRightRadius={8}
		>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
				<ThemedText style={styles.sectionTitle}>Playlists</ThemedText>
				<AnimatedPressable onPress={() => props.setPopup({ type: 'addPlaylist', id: '' })}>
					<PlaylistDisplayAdd />
				</AnimatedPressable>
			</View>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				bounces={false}
				contentContainerStyle={styles.playlistContent}
			>
				{props.likesData !== undefined && (
					<View style={styles.playlistItem}>
						<AnimatedPressable
							style={{ flex: 1 }}
							onPress={() => props.setPopup({ type: 'like', like: props.likesData })}
						>
							<PlaylistDisplay
								title="Likes"
								size={props.likesData.length}
								backgroundColorCover="#2825c98a"
								duration={props.likesData.reduce(
									(total, item) => total + (item.track?.duration ?? 0),
									0
								)}
							>
								<Heart color="#fff" fill="#fff" />
							</PlaylistDisplay>
						</AnimatedPressable>
					</View>
				)}

				{playlists.map((playlist: PlaylistOutput) => (
					<View key={playlist.id} style={styles.playlistItem}>
						<AnimatedPressable
							style={{ flex: 1 }}
							onPress={() => props.setPopup({ type: 'playlist', id: playlist.id })}
						>
							<PlaylistDisplay
								id={playlist.id}
								title={playlist.name}
								size={playlist.tracks.length}
								duration={playlist.tracks.reduce(
									(total: number, item) => total + (item.track?.duration ?? 0),
									0
								)}
								backgroundColorCover="#00000018"
							>
								{playlist.cover ? (
									<Image style={styles.playlistCover} source={{ uri: playlist.cover }} />
								) : (
									<Music2 color="rgba(255,255,255,0.65)" size={28} />
								)}
							</PlaylistDisplay>
						</AnimatedPressable>
						<Pressable
							accessibilityLabel={`Edit ${playlist.name}`}
							style={styles.menuButton}
							onPress={() => props.setPopup({ type: 'editPlaylist', id: playlist.id })}
						>
							<MoreVertical size={18} color="#fff" />
						</Pressable>
					</View>
				))}
			</ScrollView>
		</LiquidGlass>
	);
}
