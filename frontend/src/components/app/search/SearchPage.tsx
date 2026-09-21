import { useAuth } from '@/src/context/AuthContext';
import { useLikesQuery, usePlaylistsInfiniteQuery, useSearchQuery, useTopMusicQuery } from '@/src/lib/fetcher/tanstack';
import { OutputTrackDeezer } from '@/src/types/deezer/OutputDeezerTrack';
import { PlaylistOutput } from '@/src/types/playlist/PlaylistOutput';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import LiquidGlass from '../../LiquidGlass';
import { ThemedText } from '../../themed-text';
import { Popup } from '../../ui/Popup';
import { SeparatorFull } from '../../ui/separator';
import { homeStyles } from '../home.styles';
import { AlbumProfileMobile } from './AlbumProfileMobile';
import { ArtistProfileMobile } from './ArtisteProfileMobile';
import { PlaylistDisplay } from './PlaylistDisplay';
import { SongDisplayMobile } from './SongDisplayMobile';
import { SongProfileMobile } from './SongProfileMobile';
import { PlaylistCreate } from './playlist/PlaylistCreate';
import { styles } from './styles/SearchPageStyle';
import { PlaylistProfile } from './playlist/PlaylistProfile';

interface SearchPageProps {
	onPlayTrack?: (track: OutputTrackDeezer) => void;
}

type PopupState =
	| { type: 'song'; song: OutputTrackDeezer }
	| { type: 'artist'; id: string }
	| { type: 'album'; id: string }
	| { type: 'addPlaylist'; id: string }
	| { type: 'playlist'; id: string }
	| null;

const SEARCH_DEBOUNCE_MS = 200;
const MIN_SEARCH_LENGTH = 2;
const TOP_MUSIC_LIMIT = 50;
const SEARCH_LIMIT = 20;

export function SearchPage({ onPlayTrack }: SearchPageProps) {
	const { token } = useAuth();

	const [query, setQuery] = useState('');
	const [debouncedQuery, setDebouncedQuery] = useState('');
	const [popup, setPopup] = useState<PopupState>(null);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDebouncedQuery(query.trim());
		}, SEARCH_DEBOUNCE_MS);

		return () => clearTimeout(timeout);
	}, [query]);

	const isSearching = debouncedQuery.length >= MIN_SEARCH_LENGTH;

	const { data: playlistsData, error: playlistsError } = usePlaylistsInfiniteQuery(token ?? '');
	const { data: likesData, error: likesError } = useLikesQuery(token ?? '');
	const { data: topMusicData, isLoading: topMusicLoading } = useTopMusicQuery(TOP_MUSIC_LIMIT);
	const { data: searchData, isLoading: searchLoading } = useSearchQuery(debouncedQuery, SEARCH_LIMIT);

	if (playlistsError) console.error('[SearchPage] playlists query failed', playlistsError);
	if (likesError) console.error('[SearchPage] likes query failed', likesError);

	useEffect(() => {
		console.log('topMusicData:', topMusicData);
		console.log('searchData:', searchData);
	}, [topMusicData, searchData]);

	const tracks = isSearching ? (searchData ?? []) : (topMusicData ?? []);
	const tracksLoading = isSearching ? searchLoading : topMusicLoading;
	const playlists = playlistsData?.pages.flatMap((page) => page.data ?? []) ?? [];

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
						{...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {})}
					/>
				</LiquidGlass>

				<SeparatorFull />

				<View style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
					<ThemedText style={homeStyles.sectionTitle}>Playlists</ThemedText>
					<Pressable
						style={homeStyles.sectionTitle}
						onPress={() => setPopup({ type: 'addPlaylist', id: '' })}
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
						{likesData !== undefined && (
							<View style={styles.playlistItem}>
								<PlaylistDisplay title="Likes" size={likesData.length} backgroundColorCover="#2825c98a">
									<Heart color="#fff" fill="#fff" />
								</PlaylistDisplay>
							</View>
						)}

						{playlists.map((playlist: PlaylistOutput) => (
							<View key={playlist.id} style={styles.playlistItem}>
								<Pressable
									style={homeStyles.sectionTitle}
									onPress={() => setPopup({ type: 'playlist', id: playlist.id })}
								>
									<PlaylistDisplay
										id={playlist.id}
										title={playlist.name}
										size={playlist.music.length}
										backgroundColorCover="#24961594"
									>
										<Image
											style={{ height: 64, width: 64, borderRadius: 12 }}
											source={{ uri: playlist.cover }}
										/>
									</PlaylistDisplay>
								</Pressable>
							</View>
						))}
					</ScrollView>
				</View>

				<SeparatorFull />

				<ThemedText style={homeStyles.sectionTitle}>Songs</ThemedText>

				<View style={styles.songSection}>
					<View style={styles.songListShell}>
						{tracksLoading && tracks.length == 0 ? (
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
										key={`${song.deezerCUID}-${index}`}
										song={song}
										onPress={() => setPopup({ type: 'song', song })}
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
							onArtistPress={(artistId) => setPopup({ type: 'artist', id: String(artistId) })}
							onAlbumPress={(albumId) => setPopup({ type: 'album', id: String(albumId) })}
						/>
					)}

					{popup.type === 'artist' && (
						<ArtistProfileMobile
							id={popup.id}
							onSongPress={(song) => setPopup({ type: 'song', song })}
							onAlbumPress={(album) => setPopup({ type: 'album', id: String(album.id) })}
						/>
					)}

					{popup.type === 'album' && (
						<AlbumProfileMobile
							id={popup.id}
							onSongPress={(song) => setPopup({ type: 'song', song })}
							onArtistPress={(artistId) => setPopup({ type: 'artist', id: String(artistId) })}
						/>
					)}

					{popup.type === 'addPlaylist' && <PlaylistCreate setPopup={setPopup} />}
					{popup.type === 'playlist' && <PlaylistProfile setPopup={setPopup} id={popup.id} />}
				</Popup>
			)}
		</View>
	);
}
