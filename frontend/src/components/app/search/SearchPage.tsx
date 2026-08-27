import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { api } from '@/src/lib/api/client';

import { DeezerTrack } from '@/src/types/deezer/deezer';
import { setTracks } from '@/src/utils/debug';
import LiquidGlass from '../../LiquidGlass';
import { ThemedText } from '../../themed-text';
import { Popup } from '../../ui/Popup';
import { SeparatorFull } from '../../ui/separator';
import { AlbumProfile } from '../AlbumProfile';
import { ArtistProfile } from '../ArtisteProfile';
import { homeStyles } from '../home.styles';
import { SongProfile } from '../SongProfile';
import { PlaylistDisplay } from './PlaylistDisplay';
import { SongDisplayMobile } from './SongDisplayMobile';
import { InputForm } from '../../InputForm';
import { EyeClosed, EyeIcon, Heart } from 'lucide-react-native';
import { useAuth } from '@/src/context/AuthContext';
import { Like } from '@/src/types/user/like';

interface ApiResponse<T> {
	success: boolean;
	message?: string;
	data?: T;
}

const searchPlaylists = [
	{ id: '1', title: 'Chill Vibes', cover: '#f6b26b', songs: 12 },
	{ id: '2', title: 'Workout Energy', cover: '#7ec8e3', songs: 18 },
	{ id: '3', title: 'Late Night Coding', cover: '#9b59b6', songs: 24 },
	{ id: '4', title: 'Morning Coffee', cover: '#ff7f50', songs: 15 },
	{ id: '5', title: 'Road Trip', cover: '#5eead4', songs: 20 },
	{ id: '6', title: 'Focus Flow', cover: '#f9a8d4', songs: 16 },
	{ id: '7', title: 'Chill Vibes', cover: '#f6b26b', songs: 12 },
	{ id: '8', title: 'Workout Energy', cover: '#7ec8e3', songs: 18 },
	{ id: '9', title: 'Late Night Coding', cover: '#9b59b6', songs: 24 },
	{ id: '10', title: 'Morning Coffee', cover: '#ff7f50', songs: 15 },
] as const;

interface SearchPageProps {
	onNavigateHome?: (playlistId: number) => void;
}

type PopupState =
	| {
			type: 'song';
			song: DeezerTrack;
	  }
	| {
			type: 'artist';
			id: string;
	  }
	| {
			type: 'album';
			id: string;
	  }
	| {
			type: 'addPlaylist';
			id: string;
	  }
	| null;

export function SearchPage({ onNavigateHome }: SearchPageProps) {
	const [query, setQuery] = useState('');
	const [tracks, setTracksState] = useState<DeezerTrack[]>([]);
	const [tracksLoading, setTracksLoading] = useState(true);
	const [popup, setPopup] = useState<PopupState>(null);
	const [ urlImage, setUrlImage ] = useState<string>('');
	const [ visibilityPlaylist, setVisibilityPlaylist ] = useState<boolean>(false);
	const [ playlistName, setPlaylistName ] = useState<string>('');
	const [ playlistDescription, setPlaylistDescription ] = useState<string>('');
	const { token } = useAuth();

	const [ likes, setLikes ] = useState<Like[]>();
	const [ newLike, setNewLike ] = useState<boolean>(false);
	
	useEffect(() => {
		const listLike = async () => {
			const value = await api.user.like.likes(token ?? '');
			if (value.data)
				setLikes(value.data.likes);
			setNewLike(false);
		}

		listLike();
	}, [newLike]);

	useEffect(() => {
		const timeout = setTimeout(async () => {
			try {
				setTracksLoading(true);

				const value = query.trim();

				let data: ApiResponse<DeezerTrack[]>;

				if (value.length < 2) {
					data = await api.deezer.music.top_music(50);
				} else {
					data = await api.deezer.search(value, 20);
				}

				const list = Array.isArray(data.data) ? data.data : (data.data as any)?.data;

				if (!Array.isArray(list)) {
					setTracksState([]);
					setTracks([]);
					return;
				}

				const validTracks = list.filter((track: DeezerTrack) => typeof track.album?.cover === 'string');

				setTracksState(validTracks);
				setTracks(validTracks);
			} catch (error) {
				console.error('[SearchPage] search failed', error);
			} finally {
				setTracksLoading(false);
			}
		}, 200);

		return () => clearTimeout(timeout);
	}, [query]);

	const addPlaylistToDb = async () => {
		const data = await api.user.playlist(playlistName, urlImage, playlistDescription, visibilityPlaylist, token ?? '');
		if (data.success) {
			setUrlImage('');
			setPlaylistName('');
			setPlaylistDescription('');
		}
	}

	return (
		<View style={styles.searchRoot}>
			<View style={styles.searchContent}>
				<LiquidGlass
					style={styles.searchBar}
					contentStyle={styles.searchBarContent}
					intensity={30}
					radius={16}
					topLeftRadius={16}
					topRightRadius={16}
					bottomLeftRadius={16}
					bottomRightRadius={16}
					shimmer={false}
					chromatic={false}
				>
					<TextInput
						value={query}
						onChangeText={setQuery}
						placeholder="Search..."
						placeholderTextColor="rgba(255,255,255,0.5)"
						style={styles.searchInput}
						autoCapitalize="none"
						autoCorrect={false}
						selectionColor="rgba(255,255,255,0.7)"
						underlineColorAndroid="transparent"
						{...(Platform.OS === 'web'
							? ({
									outlineStyle: 'none',
								} as any)
							: {})}
					/>
				</LiquidGlass>

				<SeparatorFull />

				
				<View style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
					<ThemedText style={homeStyles.sectionTitle}>Playlists</ThemedText>
					<Pressable style={ homeStyles.sectionTitle} 
						onPress={() =>
							setPopup({
								type: 'addPlaylist',
								id: '',
							})
						}>Add playlist</Pressable>
				</View>
				<View style={styles.playlistContainer}>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						bounces={false}
						contentContainerStyle={styles.playlistContent}
					>
						{ likes != undefined && 
							<View style={styles.playlistItem}>
								<PlaylistDisplay title='Likes' size={likes.length} backgroundColorCover='#2825c98a'>
									<Heart color={'#fff'} fill={'#fff'}></Heart>
								</PlaylistDisplay>
							</View>
						}
						{searchPlaylists.map((playlist) => (
							<View key={playlist.id} style={styles.playlistItem}>
								<PlaylistDisplay id={playlist.id}  title={playlist.title} size={playlist.songs} backgroundColorCover='#24961594'>
									<Image style={{ height: 64, width: 64, borderRadius: 12}} source={{ uri: 'https://imgs.search.brave.com/4CpRl9vd35aqG2dfWnXw7AK-iwHm-ujHdbuXbpDffcI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudW5zcGxhc2gu/Y29tL3Bob3RvLTE1/NDA5NzkzODg3ODkt/NmNlZTI4YTFjZGM5/P2ZtPWpwZyZxPTYw/Jnc9MzAwMCZhdXRv/PWZvcm1hdCZmaXQ9/Y3JvcCZpeGxpYj1y/Yi00LjEuMCZpeGlk/PU0zd3hNakEzZkRC/OE1IeHpaV0Z5WTJo/OE1USjhmRzF2Ym5S/aFoyNWxjM3hsYm53/d2ZId3dmSHg4TUE9/PQ' }} ></Image>
								</PlaylistDisplay>
							</View>
						))}
					</ScrollView>

					<View style={styles.playlistFades} pointerEvents="none">
						<LinearGradient
							colors={['rgba(8,11,26,0.65)', 'rgba(8,11,26,0.15)', 'transparent']}
							locations={[0, 0.45, 1]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 0 }}
							style={styles.fadeLeft}
						/>

						<LinearGradient
							colors={['transparent', 'rgba(8,11,26,0.15)', 'rgba(8,11,26,0.65)']}
							locations={[0, 0.55, 1]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 0 }}
							style={styles.fadeRight}
						/>
					</View>
				</View>

				<SeparatorFull />

				<ThemedText style={homeStyles.sectionTitle}>Songs</ThemedText>

				<View style={styles.songSection}>
					<View style={styles.songListShell}>
						{tracksLoading ? (
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
								{tracks.map((song, index) => (
									<SongDisplayMobile
										key={`${song.deezerCUID}-${song.albumId}-${index}`}
										song={song}
										onPress={() =>
											setPopup({
												type: 'song',
												song,
											})
										}
										onLike={setNewLike}
									/>
								))}
							</ScrollView>
						)}

						<LinearGradient
							colors={['rgba(10,12,18,0.95)', 'rgba(10,12,18,0.4)', 'transparent']}
							locations={[0, 0.45, 1]}
							style={styles.songListFade}
							pointerEvents="none"
						/>
					</View>
				</View>
			</View>

			{popup && (
				<Popup onClose={() => setPopup(null)}>
					{popup.type === 'song' && (
						<SongProfile
							song={popup.song}
							onArtistPress={(artistId) =>
								setPopup({
									type: 'artist',
									id: String(artistId),
								})
							}
							onAlbumPress={(albumId) =>
								setPopup({
									type: 'album',
									id: String(albumId),
								})
							}
						/>
					)}

					{popup.type === 'artist' && (
						<ArtistProfile
							id={popup.id}
							onSongPress={(song) =>
								setPopup({
									type: 'song',
									song,
								})
							}
							onAlbumPress={(album) =>
								setPopup({
									type: 'album',
									id: String(album.id),
								})
							}
						/>
					)}

					{popup.type === 'album' && (
						<AlbumProfile
							id={popup.id}
							onSongPress={(song) =>
								setPopup({
									type: 'song',
									song,
								})
							}
							onArtistPress={(artistId) =>
								setPopup({
									type: 'artist',
									id: String(artistId),
								})
							}
						/>
					)}

					{popup.type === 'addPlaylist' && (
						<View style={{ padding: 20, flexDirection: 'row', gap: 25 }}>
							<View style={{ width: 250, height: 250, backgroundColor: '#ffffffd0', borderRadius: 15, overflow: 'hidden' }}>
								{urlImage ? (
									<Image source={{ uri: urlImage }} style={{ width: 250, height: 250 }} />
								) : null}
							</View>
							<View style={{ display: 'flex', padding: 10, flexDirection: 'column', gap: 10 }}>
								<InputForm
									isEmail={false}
									placeholder="Playlist name"
									inputValue={playlistName}
									setInputValue={setPlaylistName}
								/>
								<InputForm
									isEmail={false}
									placeholder="Description"
									inputValue={playlistDescription}
									setInputValue={setPlaylistDescription}
								/>
								<InputForm
									isEmail={false}
									placeholder="Image Url"
									inputValue={urlImage}
									setInputValue={setUrlImage}
								/>
								<View>
									<ThemedText style={{ color: '#ffffff' }}>Playlist visibility</ThemedText>
									<Pressable onPress={() => setVisibilityPlaylist(!visibilityPlaylist)}>
										{visibilityPlaylist ? <EyeIcon color={'#ffffff'} /> : <EyeClosed color={'#ffffff'} />}
									</Pressable>
								</View>
								<Pressable>
									<ThemedText style={{ color: '#ffffff' }} onPress={() => {
										addPlaylistToDb();
										setPopup(null);
									}}>ADD</ThemedText>
								</Pressable>
							</View>
						</View>
					)}
				</Popup>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	searchRoot: {
		flex: 1,
		width: '100%',
		paddingTop: 40,
	},

	searchContent: {
		flex: 1,
		width: '100%',
		paddingHorizontal: 1,
		paddingTop: 20,
	},

	searchBar: {
		width: '100%',
		minHeight: 48,
		marginBottom: 12,
	},

	searchBarContent: {
		flex: 1,
		paddingHorizontal: 14,
		paddingVertical: 0,
		justifyContent: 'center' as const,
	},

	searchInput: {
		width: '100%',
		height: 46,
		paddingHorizontal: 0,
		paddingVertical: 0,
		margin: 0,
		color: '#fff',
		fontSize: 16,
		lineHeight: 20,
		textAlignVertical: 'center' as const,
	},

	playlistContainer: {
		position: 'relative' as const,
		width: '100%',
		height: 125,
	},

	playlistContent: {
		paddingHorizontal: 4,
		gap: 10,
		alignItems: 'center' as const,
	},

	playlistItem: {
		height: '100%',
	},

	playlistFades: {
		position: 'absolute' as const,
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
	},

	fadeLeft: {
		position: 'absolute' as const,
		left: 0,
		top: 0,
		bottom: 0,
		width: 28,
	},

	fadeRight: {
		position: 'absolute' as const,
		right: 0,
		top: 0,
		bottom: 0,
		width: 28,
	},

	songSection: {
		flex: 1,
		minHeight: 0,
		width: '100%',
	},

	songListShell: {
		flex: 1,
		minHeight: 0,
		width: '100%',
		borderRadius: 15,
		overflow: 'hidden' as const,
	},

	songListScroll: {
		flex: 1,
		width: '100%',
	},

	songListContent: {
		paddingTop: 10,
		paddingHorizontal: 8,
		paddingBottom: 150,
		gap: 8,
	},

	songListFade: {
		position: 'absolute' as const,
		top: 0,
		left: 0,
		right: 0,
		height: 4,
		zIndex: 2,
	},

	loadingContainer: {
		flex: 1,
		minHeight: 180,
		alignItems: 'center' as const,
		justifyContent: 'center' as const,
		gap: 10,
	},

	loadingText: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.5)',
	},
});
