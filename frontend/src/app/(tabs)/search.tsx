import { styles } from '@/src/app/(tabs)/SearchPage.styles';
import { TabKey } from '@/src/components/home/BottomNavigation';
import { WebHomeHeader } from '@/src/components/home/WebHomeHeader';
import { AlbumProfileMobile } from '@/src/components/search/AlbumProfileMobile';
import { ArtistProfileMobile } from '@/src/components/search/ArtisteProfileMobile';
import { PlaylistCreate } from '@/src/components/search/PlaylistCreate';
import { PlaylistEdit } from '@/src/components/search/PlaylistEdit';
import PlaylistList from '@/src/components/search/PlaylistList';
import { PlaylistLikeProfile, PlaylistProfile } from '@/src/components/search/PlaylistProfile';
import { SectionBanner } from '@/src/components/search/SectionBanner';
import { SongList } from '@/src/components/search/SongList';
import { SongProfileMobile } from '@/src/components/search/SongProfileMobile';
import { AnimatedPressable } from '@/src/components/ui/AnimatedPressable';
import { Popup } from '@/src/components/ui/Popup';
import { ThemedText } from '@/src/components/utils/themed-text';
import { ThemedView } from '@/src/components/utils/themed-view';
import { useAuth } from '@/src/context/AuthContext';
import { useLikesQuery, usePlaylistsInfiniteQuery, useSearchQuery, useTopMusicQuery } from '@/src/lib/fetcher/tanstack';
import { OutputTrackDeezer } from '@/src/types/deezer/OutputDeezerTrack';
import { Like } from '@/src/types/user/like';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, View, useWindowDimensions } from 'react-native';

interface SearchPageProps {
	onPlayTrack?: (track: OutputTrackDeezer) => void;
	setActiveTab: (value: TabKey) => void;
	activeTab: TabKey;
}

export type PopupState =
	| { type: 'song'; song: OutputTrackDeezer }
	| { type: 'artist'; id: string }
	| { type: 'album'; id: string }
	| { type: 'addPlaylist'; id: string }
	| { type: 'editPlaylist'; id: string }
	| { type: 'playlist'; id: string }
	| { type: 'like'; like: Like[] | undefined }
	| null;

const SEARCH_DEBOUNCE_MS = 200;
const MIN_SEARCH_LENGTH = 2;
const TOP_MUSIC_LIMIT = 50;
const SEARCH_LIMIT = 20;

function formatDuration(totalSeconds: number) {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

export function SearchScreen(props: SearchPageProps) {
	const { token } = useAuth();
	const { width } = useWindowDimensions();

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

	const playlists = playlistsData?.pages.flatMap((page) => page.data ?? []) ?? [];
	const likedAlbums = likesData
		? Array.from(
				likesData
					.reduce((albums, like) => {
						const album = like.track.album;
						if (!album?.deezerCUID) return albums;

						const current = albums.get(album.deezerCUID) ?? { album, likes: 0, duration: 0 };
						current.likes += 1;
						current.duration += like.track.duration ?? 0;
						albums.set(album.deezerCUID, current);
						return albums;
					}, new Map<string, { album: NonNullable<Like['track']['album']>; likes: number; duration: number }>())
					.values()
			).sort((left, right) => right.likes - left.likes)
		: [];
	const showLikedAlbums = width >= 768;

	return (
		<ThemedView style={styles.root}>
			<View style={styles.backgroundOverlay} />
			<View style={styles.searchRoot}>
				<View style={styles.searchContent}>
					<View style={styles.desktopLayout}>
						<WebHomeHeader
							activeTab={props.activeTab}
							onSelect={props.setActiveTab}
							setQuery={setQuery}
							query={query}
						/>

						<View style={styles.mainColumn}>
							<PlaylistList setPopup={setPopup} likesData={likesData} playlists={playlists} />
							<View style={{ flexDirection: 'column', flex: 1 }}>
								<SectionBanner
									isSearching={isSearching}
									query={debouncedQuery}
									count={isSearching ? (searchData?.length ?? 0) : (topMusicData?.length ?? 0)}
									loading={isSearching ? searchLoading : topMusicLoading}
								/>
								<SongList
									setPopup={setPopup}
									playlists={playlists}
									tracks={isSearching ? (searchData ?? []) : (topMusicData ?? [])}
									tracksLoading={isSearching ? searchLoading : topMusicLoading}
								/>
							</View>

							{showLikedAlbums && (
								<View style={styles.likedAlbumsSection}>
									<View
										style={{
											flex: 1,
											backgroundColor: 'rgb(19, 19, 19)',
											borderRadius: 6,
											padding: 10,
											position: 'relative',
											alignSelf: 'stretch',
										}}
									>
										<ThemedText style={styles.sectionTitle}>
											Liked albums ({likedAlbums.length})
										</ThemedText>
										<ScrollView
											style={styles.likedAlbumsScroll}
											contentContainerStyle={styles.likedAlbumsContent}
											showsVerticalScrollIndicator={false}
										>
											{likedAlbums.length === 0 ? (
												<ThemedText style={styles.emptyAlbumsText}>
													No liked albums yet
												</ThemedText>
											) : (
												likedAlbums.map((album) => (
													<AnimatedPressable
														key={album.album.deezerCUID}
														style={styles.likedAlbumItem}
														onPress={() =>
															setPopup({ type: 'album', id: album.album.deezerCUID })
														}
													>
														{album.album.coverMedium || album.album.cover ? (
															<Image
																source={{
																	uri:
																		album.album.coverMedium ??
																		album.album.cover ??
																		'',
																}}
																style={styles.likedAlbumCover}
															/>
														) : (
															<View style={styles.likedAlbumPlaceholder} />
														)}
														<ThemedText style={styles.likedAlbumTitle} numberOfLines={2}>
															{album.album.title}
														</ThemedText>
														<ThemedText style={styles.albumMeta}>
															{album.likes} likes · {formatDuration(album.duration)}
														</ThemedText>
													</AnimatedPressable>
												))
											)}
										</ScrollView>
									</View>
								</View>
							)}
						</View>
					</View>
				</View>

				{popup && (
					<Popup onClose={() => setPopup(null)}>
						{popup.type === 'song' && (
							<SongProfileMobile
								song={popup.song}
								onPlay={() => {
									props.onPlayTrack?.(popup.song);
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
						{popup.type === 'editPlaylist' && <PlaylistEdit id={popup.id} setPopup={setPopup} />}
						{popup.type === 'playlist' && <PlaylistProfile setPopup={setPopup} id={popup.id} />}
						{popup.type === 'like' && <PlaylistLikeProfile setPopup={setPopup} like={popup.like} />}
					</Popup>
				)}
			</View>
		</ThemedView>
	);
}
