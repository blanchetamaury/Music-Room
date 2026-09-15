import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

import { api } from '@/src/lib/api/client';
import { setTracks } from '@/src/utils/debug';
import LiquidGlass from '../../LiquidGlass';
import { ThemedText } from '../../themed-text';
import { Popup } from '../../ui/Popup';
import { SeparatorFull } from '../../ui/separator';
import { homeStyles } from '../home.styles';

import { useAuth } from '@/src/context/AuthContext';
import { OutputTrackDeezer } from '@/src/types/deezer/OutputDeezerTrack';
import { PlaylistOutput } from '@/src/types/playlist/PlaylistOutput';
import { Like } from '@/src/types/user/like';
import { Heart } from 'lucide-react-native';
import { AlbumProfileMobile } from './AlbumProfileMobile';
import { ArtistProfileMobile } from './ArtisteProfileMobile';
import { PlaylistDisplay } from './PlaylistDisplay';
import { PlaylistProfileMobile } from './PlaylistProfileMobile';
import { styles } from './SearchPageStyle';
import { SongDisplayMobile } from './SongDisplayMobile';
import { SongProfileMobile } from './SongProfileMobile';

interface ApiResponse<T> {
	success: boolean;
	message?: string;
	data?: T;
}

interface SearchPageProps {
	onNavigateHome?: (playlistId: number) => void;
	onPlayTrack?: (track: OutputTrackDeezer) => void;
}

type PopupState =
	| {
			type: 'song';
			song: OutputTrackDeezer;
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

export function SearchPage({ onNavigateHome, onPlayTrack }: SearchPageProps) {
	const [query, setQuery] = useState('');
	const [tracks, setTracksState] = useState<OutputTrackDeezer[]>([]);
	const [tracksLoading, setTracksLoading] = useState(true);
	const [popup, setPopup] = useState<PopupState>(null);
	const [urlImage, setUrlImage] = useState<string>('');
	const [visibilityPlaylist, setVisibilityPlaylist] = useState<boolean>(false);
	const [playlistName, setPlaylistName] = useState<string>('');
	const [playlistDescription, setPlaylistDescription] = useState<string>('');
	const { token } = useAuth();
	const [likes, setLikes] = useState<Like[]>();
	const [newLike, setNewLike] = useState<boolean>(false);
	const [playlists, setPlaylists] = useState<PlaylistOutput[]>();

	useEffect(() => {
		const listLike = async () => {
			const value = await api.user.like.likes(token ?? '');
			if (value.data) setLikes(value.data);
			setNewLike(false);
		};

		const listPlaylist = async () => {
			const value = await api.user.playlist.playlists(token ?? '');
			if (value.data)
				setPlaylists(value.data);
		}

		listLike();
		listPlaylist();
	}, [newLike, token]);

	useEffect(() => {
		const timeout = setTimeout(async () => {
			try {
				setTracksLoading(true);

				const value = query.trim();

				let data: ApiResponse<OutputTrackDeezer[]>;

				if (value.length < 2) {
					data = await api.deezer.music.top_music(50);
				} else {
					data = await api.deezer.search(value, 20);
				}

				if (!data.data) {
					setTracksState([]);
					setTracks([]);
					return;
				}

				setTracksState(data.data);
				setTracks(data.data);
			} catch (error) {
				console.error('[SearchPage] search failed', error);
			} finally {
				setTracksLoading(false);
			}
		}, 200);

		return () => clearTimeout(timeout);
	}, [query]);

	const addPlaylistToDb = async () => {
		const data = await api.user.playlist.create(
			playlistName,
			urlImage,
			playlistDescription,
			visibilityPlaylist,
			token ?? ''
		);
		if (data.success) {
			setUrlImage('');
			setPlaylistName('');
			setPlaylistDescription('');
		}
	};

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
					<Pressable
						style={homeStyles.sectionTitle}
						onPress={() =>
							setPopup({
								type: 'addPlaylist',
								id: '',
							})
						}
					>
						<ThemedText style={homeStyles.sectionTitle}>ADD playlists</ThemedText>
					</Pressable>
				</View>
				<View style={styles.playlistContainer}>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						bounces={false}
						contentContainerStyle={styles.playlistContent}
					>
						{likes != undefined && (
							<View style={styles.playlistItem}>
								<PlaylistDisplay title="Likes" size={likes.length} backgroundColorCover="#2825c98a">
									<Heart color={'#fff'} fill={'#fff'}></Heart>
								</PlaylistDisplay>
							</View>
						)}
						{playlists && playlists.map((playlist) => (
							<View key={playlist.id} style={styles.playlistItem}>
								<PlaylistDisplay
									id={playlist.id}
									title={playlist.name}
									size={playlist.music.length}
									backgroundColorCover="#24961594"
								>
									<Image
										style={{ height: 64, width: 64, borderRadius: 12 }}
										source={{
											uri: playlist.cover,
										}}
									></Image>
								</PlaylistDisplay>
							</View>
						))}
					</ScrollView>
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
										key={`${song.deezerCUID}-${song.deezerCUID}-${index}`}
										song={song}
										onPress={() =>
											setPopup({
												type: 'song',
												song,
											})
										}
										onLike={setNewLike}
										playlists={playlists}
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
						<SongProfileMobile
							song={popup.song}
							onPlay={() => {
								onPlayTrack?.(popup.song);
								setPopup(null);
							}}
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
						<ArtistProfileMobile
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
						<AlbumProfileMobile
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
						<PlaylistProfileMobile
							addPlaylistToDb={addPlaylistToDb}
							setPopup={setPopup}
						/>
					)}
				</Popup>
			)}
		</View>
	);
}