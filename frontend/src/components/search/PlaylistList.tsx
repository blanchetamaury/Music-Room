import { Image, Pressable, ScrollView, View } from 'react-native';
import { ThemedText } from '../utils/themed-text';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { PlaylistDisplay, PlaylistDisplayAdd } from './PlaylistDisplay';
import { PlaylistOutput } from '@/src/types/playlist/PlaylistOutput';
import { Like } from '@/src/types/user/like';
import { Heart, MoreVertical } from 'lucide-react-native';
import { styles } from './PlaylistList.styles';
import { PopupState } from '@/src/app/(tabs)/search';

interface PlaylistListProps {
	setPopup: (value: PopupState) => void;
	likesData: Like[] | undefined;
	playlists: PlaylistOutput[] | undefined;
}

export default function PlaylistList(props: PlaylistListProps) {
	const playlists = [...(props.playlists ?? [])].sort((left, right) => right.music.length - left.music.length);

	return (
		<View style={styles.playlistContainer}>
			<ThemedText style={styles.sectionTitle}>Playlists</ThemedText>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				bounces={false}
				contentContainerStyle={styles.playlistContent}
			>
				<View style={styles.playlistItem}>
					<AnimatedPressable
						style={{ flex: 1 }}
						onPress={() => props.setPopup({ type: 'addPlaylist', id: '' })}
					>
						<PlaylistDisplayAdd />
					</AnimatedPressable>
				</View>

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
								size={playlist.music.length}
								duration={playlist.music.reduce(
									(total, item) => total + (item.track?.duration ?? 0),
									0
								)}
								backgroundColorCover="#00000018"
							>
								<Image style={styles.playlistCover} source={{ uri: playlist.cover }} />
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
		</View>
	);
}
