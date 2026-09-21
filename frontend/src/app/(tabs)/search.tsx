import { AlbumProfileMobile } from '@/src/components/search/AlbumProfileMobile';
import { ArtistProfileMobile } from '@/src/components/search/ArtisteProfileMobile';
import { PlaylistCreate } from '@/src/components/search/PlaylistCreate';
import { PlaylistDisplay } from '@/src/components/search/PlaylistDisplay';
import { PlaylistProfile } from '@/src/components/search/PlaylistProfile';
import { SongDisplayMobile } from '@/src/components/search/SongDisplayMobile';
import { SongProfileMobile } from '@/src/components/search/SongProfileMobile';
import FluidBackground, { FluidColors } from '@/src/components/ui/FluideBackground';
import { Popup } from '@/src/components/ui/Popup';
import { SeparatorFull } from '@/src/components/ui/separator';
import LiquidGlass from '@/src/components/utils/LiquidGlass';
import { ThemedText } from '@/src/components/utils/themed-text';
import { useAuth } from '@/src/context/AuthContext';
import { useLikesQuery, usePlaylistsInfiniteQuery, useSearchQuery, useTopMusicQuery } from '@/src/lib/fetcher/tanstack';
import { OutputTrackDeezer } from '@/src/types/deezer/OutputDeezerTrack';
import { PlaylistOutput } from '@/src/types/playlist/PlaylistOutput';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { searchStyles } from './styles/search.styles';
import { ThemedView } from '@/src/components/utils/themed-view';

interface SearchPageProps {
	onPlayTrack?: (track: OutputTrackDeezer) => void;
}

const tabColors: Record<'search', FluidColors> = {
	search: {
		colour1: [0.05, 0.25, 0.15, 1],
		colour2: [0.05, 0.8, 0.35, 1],
		colour3: [0.2, 0.9, 0.7, 1],
	},
};

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

export function SearchScreen({ onPlayTrack }: SearchPageProps) {
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
		<ThemedView style={{ flex: 1 }}>
			<FluidBackground colors={tabColors['search']} />
			<View style={searchStyles.backgroundOverlay} />

			<View style={searchStyles.searchRoot}>
				<View style={searchStyles.searchContent}>
					<LiquidGlass
						style={searchStyles.searchBar}
						contentStyle={searchStyles.searchBarContent}
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
							style={searchStyles.searchInput}
							autoCapitalize="none"
							autoCorrect={false}
							selectionColor="rgba(255,255,255,0.7)"
							underlineColorAndroid="transparent"
							{...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {})}
						/>
					</LiquidGlass>

					<SeparatorFull />

					<View style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
						<ThemedText style={searchStyles.sectionTitle}>Playlists</ThemedText>
						<Pressable
							style={searchStyles.sectionTitle}
							onPress={() => setPopup({ type: 'addPlaylist', id: '' })}
						>
							<ThemedText style={searchStyles.sectionTitle}>ADD playlists</ThemedText>
						</Pressable>
					</View>

					<View style={searchStyles.playlistContainer}>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							bounces={false}
							contentContainerStyle={searchStyles.playlistContent}
						>
							{likesData !== undefined && (
								<View style={searchStyles.playlistItem}>
									<PlaylistDisplay
										title="Likes"
										size={likesData.length}
										backgroundColorCover="#2825c98a"
									>
										<Heart color="#fff" fill="#fff" />
									</PlaylistDisplay>
								</View>
							)}

							{playlists.map((playlist: PlaylistOutput) => (
								<View key={playlist.id} style={searchStyles.playlistItem}>
									<Pressable
										style={searchStyles.sectionTitle}
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

					<ThemedText style={searchStyles.sectionTitle}>Songs</ThemedText>

					<View style={searchStyles.songSection}>
						<View style={searchStyles.songListShell}>
							{tracksLoading && tracks.length == 0 ? (
								<View style={searchStyles.loadingContainer}>
									<ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
									<ThemedText style={searchStyles.loadingText}>Loading songs...</ThemedText>
								</View>
							) : (
								<ScrollView
									style={searchStyles.songListScroll}
									contentContainerStyle={searchStyles.songListContent}
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
								style={searchStyles.songListFade}
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
								onSongPress={(song) => setPopup({ type: 'song', song: song })}
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
		</ThemedView>
	);
}
