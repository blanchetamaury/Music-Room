import { ActivityIndicator, ScrollView, View } from 'react-native';
import { ThemedText } from '../utils/themed-text';
import { SongDisplayMobile } from './SongDisplayMobile';
import { styles } from './SongList.styles';
import { PlaylistOutput } from '@/src/types/playlist/PlaylistOutput';
import { OutputTrackDeezer } from '@/src/types/deezer/OutputDeezerTrack';
import { PopupState } from '@/src/app/(tabs)/search';
import LiquidGlass from '../utils/LiquidGlass';

interface PlaylistListProps {
	setPopup: (value: PopupState) => void;
	playlists: PlaylistOutput[] | undefined;
	tracks: OutputTrackDeezer[];
	tracksLoading: boolean;
}

export function SongList(props: PlaylistListProps) {
	return (
		<LiquidGlass
			style={[styles.songSection]}
			contentStyle={[styles.songListContent]}
			intensity={10}
			radius={8}
			topLeftRadius={8}
			topRightRadius={8}
			bottomLeftRadius={8}
			bottomRightRadius={8}
		>
			<View style={styles.songListShell}>
				{props.tracksLoading && props.tracks.length == 0 ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
						<ThemedText style={styles.loadingText}>Loading songs...</ThemedText>
					</View>
				) : (
					<ScrollView
						style={styles.songListScroll}
						contentContainerStyle={styles.songListContent}
						showsVerticalScrollIndicator={false}
						bounces
					>
						{props.tracks.map((song, index) => (
							<SongDisplayMobile
								key={`${song.deezerCUID}-${index}`}
								song={song}
								onPress={() => props.setPopup({ type: 'song', song })}
								playlists={props.playlists}
							/>
						))}
					</ScrollView>
				)}
			</View>
		</LiquidGlass>
	);
}
