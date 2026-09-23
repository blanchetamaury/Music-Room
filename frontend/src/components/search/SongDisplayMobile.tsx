import { useAuth } from '@/src/context/AuthContext';
import { useAddMusicMutation, useLikeQuery, useManageLikeMutation } from '@/src/lib/fetcher/tanstack/user';
import { OutputTrackDeezer } from '@/src/types/deezer/OutputDeezerTrack';
import { PlaylistOutput } from '@/src/types/playlist/PlaylistOutput';
import { Banana, EllipsisVertical, Heart, ListMusic, Plus, Share2 } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Dimensions, Image, Modal, Pressable, View } from 'react-native';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import LiquidGlass from '../utils/LiquidGlass';
import { ThemedText } from '../utils/themed-text';
import { styles } from './SongDisplayMobile.styles';

interface SongDisplayProps {
	song: OutputTrackDeezer;
	onPress?: () => void;
	onArtistPress?: (artistId: string | number) => void;
	onAlbumPress?: (albumId: string | number) => void;
	onLike?: (value: boolean) => void;
	playlists?: PlaylistOutput[];
}

const DEBUG = false;

const debugBox = (color: string) => {
	if (!DEBUG) return { borderWidth: 0 };
	return { borderWidth: 2, borderColor: color, backgroundColor: `${color}22` };
};

export function SongDisplayMobile(props: SongDisplayProps) {
	const { token } = useAuth();

	const [displayMenu, setDisplayMenu] = useState<boolean>(false);
	const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
	const [displayAddToPlaylistMenu, setDisplayAddToPlaylistMenu] = useState<boolean>(false);
	const menuButtonRef = useRef<View>(null);

	const { data: likeData } = useLikeQuery(token ?? '', props.song.deezerCUID);
	const manageLikeMutation = useManageLikeMutation();
	const addMusicToPlaylistMutation = useAddMusicMutation();

	const openMenu = () => {
		menuButtonRef.current?.measureInWindow((x, y, width, height) => {
			const screenWidth = Dimensions.get('window').width;
			setMenuPosition({
				top: y + height + 4,
				right: screenWidth - (x + width),
			});
			setDisplayMenu(true);
		});
	};

	return (
		<AnimatedPressable onPress={props.onPress} style={[styles.wrapper, debugBox('#ff0000')]}>
			<LiquidGlass
				style={[styles.songCard, debugBox('#00ff00')]}
				contentStyle={[styles.songCardContent, debugBox('#0000ff')]}
				intensity={0}
				radius={8}
				topLeftRadius={8}
				topRightRadius={8}
				bottomLeftRadius={8}
				bottomRightRadius={8}
			>
				<Image
					source={{ uri: props.song.album.CoverMedium ?? '' }}
					resizeMode="cover"
					style={[styles.songCover, debugBox('#09ff00')]}
				/>

				<View style={[styles.mainRow, debugBox('#ffc400')]}>
					<View style={[styles.songInfo, debugBox('#00ffff')]}>
						<View style={[styles.songTitleRow, debugBox('#ff8800')]}>
							<ThemedText
								style={[styles.songTitle, debugBox('#ff0000')]}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{props.song.title}
							</ThemedText>

							{props.song.explicit === true && (
								<Banana
									size={14}
									color="rgba(255,255,255,0.7)"
									style={[styles.explicitIcon, debugBox('#ff00ff')]}
								/>
							)}
						</View>

						<ThemedText
							style={[styles.songArtist, debugBox('#00ff00')]}
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{props.song.artist[0].name}
						</ThemedText>
					</View>

					<View style={[styles.actions, debugBox('#ff0088')]}>
						<Pressable
							style={[styles.iconButton, debugBox('#0088ff')]}
							onPress={(event) => {
								event.stopPropagation();
								manageLikeMutation.mutate({
									trackId: props.song.deezerCUID,
									token: token ?? '',
								});
							}}
						>
							{likeData == undefined ? (
								<Heart color="#fff" fill={'#ffffff65'} size={19} />
							) : (
								<Heart color="#ff0000be" size={19} fill={'#ff0000'} />
							)}
						</Pressable>

						<Pressable
							ref={menuButtonRef}
							style={[styles.iconButton, debugBox('#8800ff')]}
							onPress={(event) => {
								event.stopPropagation();
								openMenu();
							}}
							accessibilityLabel="More options"
						>
							<EllipsisVertical color="#fff" size={20} />
						</Pressable>
					</View>
				</View>
			</LiquidGlass>

			<Modal visible={displayMenu} transparent animationType="fade" onRequestClose={() => setDisplayMenu(false)}>
				<Pressable style={styles.backdrop} onPress={() => setDisplayMenu(false)}>
					<View style={[styles.dropdownMenu, { top: menuPosition.top, right: menuPosition.right }]}>
						<Pressable
							style={styles.menuItem}
							onPress={() => {
								setDisplayMenu(false);
								setDisplayAddToPlaylistMenu(true);
							}}
						>
							<Plus color="#fff" size={18} />
							<ThemedText style={styles.menuItemText}>Ajouter à une playlist</ThemedText>
						</Pressable>

						<Pressable
							style={styles.menuItem}
							onPress={() => {
								setDisplayMenu(false);
							}}
						>
							<ListMusic color="#fff" size={18} />
							<ThemedText style={styles.menuItemText}>Ajouter à la file d'attente</ThemedText>
						</Pressable>

						<Pressable
							style={styles.menuItem}
							onPress={() => {
								setDisplayMenu(false);
								// logique partage
							}}
						>
							<Share2 color="#fff" size={18} />
							<ThemedText style={styles.menuItemText}>Partager</ThemedText>
						</Pressable>
					</View>
				</Pressable>
			</Modal>
			<Modal
				visible={displayAddToPlaylistMenu}
				transparent
				animationType="fade"
				onRequestClose={() => setDisplayAddToPlaylistMenu(false)}
			>
				<Pressable style={styles.backdrop} onPress={() => setDisplayAddToPlaylistMenu(false)}>
					<View style={[styles.dropdownMenu, { top: menuPosition.top, right: menuPosition.right }]}>
						{props.playlists &&
							props.playlists.map((row) => (
								<Pressable
									style={styles.menuItem}
									onPress={() => {
										addMusicToPlaylistMutation.mutate({
											playlistId: row.id,
											trackId: props.song.deezerCUID,
											token: token ?? '',
										});
										setDisplayAddToPlaylistMenu(false);
									}}
								>
									<Image source={{ uri: row.cover }} style={styles.cover}></Image>
									<ThemedText style={styles.menuItemText}>{row.name}</ThemedText>
								</Pressable>
							))}
					</View>
				</Pressable>
			</Modal>
		</AnimatedPressable>
	);
}
