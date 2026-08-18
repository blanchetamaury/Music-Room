import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

import LiquidGlass from '../LiquidGlass';
import { ThemedText } from '../themed-text';
import { playlistSongs } from './data';
import { homeStyles } from './home.styles';

export const searchPlaylists = [
	{ id: 1, title: 'Chill Vibes', cover: '#f6b26b', songs: 12 },
	{ id: 2, title: 'Workout Energy', cover: '#7ec8e3', songs: 18 },
	{ id: 3, title: 'Late Night Coding', cover: '#9b59b6', songs: 24 },
	{ id: 4, title: 'Morning Coffee', cover: '#ff7f50', songs: 15 },
	{ id: 5, title: 'Road Trip', cover: '#5eead4', songs: 20 },
	{ id: 6, title: 'Focus Flow', cover: '#f9a8d4', songs: 16 },
	{ id: 1, title: 'Chill Vibes', cover: '#f6b26b', songs: 12 },
	{ id: 2, title: 'Workout Energy', cover: '#7ec8e3', songs: 18 },
	{ id: 3, title: 'Late Night Coding', cover: '#9b59b6', songs: 24 },
	{ id: 4, title: 'Morning Coffee', cover: '#ff7f50', songs: 15 },
	{ id: 5, title: 'Road Trip', cover: '#5eead4', songs: 20 },
	{ id: 6, title: 'Focus Flow', cover: '#f9a8d4', songs: 16 },
] as const;

export type SearchPlaylist = (typeof searchPlaylists)[number];

interface SearchPageProps {
	onNavigateHome?: (playlistId: number) => void;
}

export function SearchPage({ onNavigateHome }: SearchPageProps) {
	const [searchText, setSearchText] = React.useState('');

	return (
		<View style={homeStyles.searchRoot}>
			<View style={homeStyles.searchContent}>
				<LiquidGlass
					style={homeStyles.searchBar}
					contentStyle={homeStyles.searchBarContent}
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
						placeholder="Search..."
						placeholderTextColor="rgba(255,255,255,0.5)"
						value={searchText}
						onChangeText={setSearchText}
						style={[
							homeStyles.searchInput,
							{ color: '#fff' },
							Platform.OS === 'web'
								? ({
										outlineWidth: 0,
										outlineColor: 'transparent',
										outlineStyle: 'none',
									} as any)
								: null,
						]}
						underlineColorAndroid="transparent"
						autoCapitalize="none"
						selectionColor="rgba(255,255,255,0.5)"
					/>
				</LiquidGlass>

				<View style={homeStyles.separator} />

				<ThemedText style={homeStyles.sectionTitle}>Playlists</ThemedText>
				<View style={homeStyles.playlistListShell}>
					<View style={homeStyles.playlistFadeContainer} pointerEvents="none">
						<LinearGradient
							colors={['rgba(8, 11, 26, 0.55)', 'rgba(8, 11, 26, 0.18)', 'transparent']}
							locations={[0, 0.45, 1]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 0 }}
							style={homeStyles.playlistFadeLeft}
						/>

						<LinearGradient
							colors={['transparent', 'rgba(8, 11, 26, 0.18)', 'rgba(8, 11, 26, 0.55)']}
							locations={[0, 0.55, 1]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 0 }}
							style={homeStyles.playlistFadeRight}
						/>
					</View>
					<ScrollView
						horizontal
						style={homeStyles.playlistListScroll}
						contentContainerStyle={homeStyles.playlistListContent}
						showsHorizontalScrollIndicator={false}
						bounces={false}
					>
						{searchPlaylists.map((playlist) => (
							<Pressable
								key={playlist.id}
								onPress={() => onNavigateHome?.(playlist.id)}
								style={homeStyles.playlistCardWrapper}
							>
								<LiquidGlass
									style={homeStyles.playlistCard}
									contentStyle={homeStyles.playlistCardContent}
									intensity={18}
									radius={16}
									topLeftRadius={16}
									topRightRadius={16}
									bottomLeftRadius={16}
									bottomRightRadius={16}
								>
									<ThemedText style={homeStyles.playlistTitle}>{playlist.title}</ThemedText>
									<View style={homeStyles.playlistBottomRow}>
										<View style={[homeStyles.playlistCover, { backgroundColor: playlist.cover }]} />
										<View style={homeStyles.playlistMeta}>
											<ThemedText style={homeStyles.playlistSongCount}>
												{playlist.songs} songs
											</ThemedText>
										</View>
										<Pressable
											onPress={(e) => {
												e.stopPropagation();
											}}
											style={homeStyles.editButton}
											accessibilityLabel="Edit playlist"
										>
											<ThemedText style={homeStyles.editButtonText}>Edit</ThemedText>
										</Pressable>
									</View>
								</LiquidGlass>
							</Pressable>
						))}
					</ScrollView>
				</View>

				<View style={homeStyles.separator} />

				<ThemedText style={homeStyles.sectionTitle}>Songs</ThemedText>
				<View style={homeStyles.songSection}>
					<View style={homeStyles.songListShell}>
						<LinearGradient
							colors={['rgba(10, 12, 18, 0.95)', 'rgba(10, 12, 18, 0.4)', 'transparent']}
							locations={[0, 0, 0.2]}
							style={homeStyles.songListFade}
							pointerEvents="none"
						/>
						<ScrollView
							style={homeStyles.songListScroll}
							contentContainerStyle={homeStyles.songListContent}
							showsVerticalScrollIndicator={false}
							bounces={false}
						>
							{playlistSongs.map((song, index) => (
								<Pressable key={`${song.title}-${index}`} onPress={() => {}}>
									<LiquidGlass
										style={homeStyles.songCard}
										contentStyle={homeStyles.songCardContent}
										intensity={18}
										radius={20}
										topLeftRadius={20}
										topRightRadius={20}
										bottomLeftRadius={20}
										bottomRightRadius={20}
									>
										<View style={[homeStyles.songCover, { backgroundColor: song.cover }]} />
										<View style={homeStyles.songInfo}>
											<ThemedText style={homeStyles.songTitle}>{song.title}</ThemedText>
											<ThemedText style={homeStyles.songArtist}>{song.artist}</ThemedText>
										</View>
										<View style={homeStyles.reorderBtn}>
											<ThemedText style={homeStyles.reorderIcon}>≡</ThemedText>
										</View>
									</LiquidGlass>
								</Pressable>
							))}
						</ScrollView>
					</View>
				</View>
			</View>
		</View>
	);
}
