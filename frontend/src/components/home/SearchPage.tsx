import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, TextInput, View } from 'react-native';

import { api } from '@/src/lib/api/client';

import LiquidGlass from '../LiquidGlass';
import { ThemedText } from '../themed-text';
import { Popup } from '../ui/Popup';

import { SeparatorFull } from '../ui/separator';
import { AlbumProfile } from './AlbumProfile';
import { ArtistProfile } from './ArtisteProfile';
import { homeStyles } from './home.styles';
import { DeezerTrack, SongDisplay } from './SongDisplay';
import { SongProfile } from './SongProfile';

const searchPlaylists = [
	{
		id: 1,
		title: 'Chill Vibes',
		cover: '#f6b26b',
		songs: 12,
	},
	{
		id: 2,
		title: 'Workout Energy',
		cover: '#7ec8e3',
		songs: 18,
	},
	{
		id: 3,
		title: 'Late Night Coding',
		cover: '#9b59b6',
		songs: 24,
	},
	{
		id: 4,
		title: 'Morning Coffee',
		cover: '#ff7f50',
		songs: 15,
	},
	{
		id: 5,
		title: 'Road Trip',
		cover: '#5eead4',
		songs: 20,
	},
	{
		id: 6,
		title: 'Focus Flow',
		cover: '#f9a8d4',
		songs: 16,
	},
	{
		id: 7,
		title: 'Chill Vibes',
		cover: '#f6b26b',
		songs: 12,
	},
	{
		id: 8,
		title: 'Workout Energy',
		cover: '#7ec8e3',
		songs: 18,
	},
	{
		id: 9,
		title: 'Late Night Coding',
		cover: '#9b59b6',
		songs: 24,
	},
	{
		id: 10,
		title: 'Morning Coffee',
		cover: '#ff7f50',
		songs: 15,
	},
	{
		id: 11,
		title: 'Road Trip',
		cover: '#5eead4',
		songs: 20,
	},
	{
		id: 12,
		title: 'Focus Flow',
		cover: '#f9a8d4',
		songs: 16,
	},
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
	| null;

export function SearchPage({ onNavigateHome }: SearchPageProps) {
	const [searchText, setSearchText] = useState('');
	const [tracks, setTracks] = useState<DeezerTrack[]>([]);
	const [tracksLoading, setTracksLoading] = useState(true);

	const [popup, setPopup] = useState<PopupState>(null);

	useEffect(() => {
		const fetchTracks = async () => {
			try {
				setTracksLoading(true);

				const value = await api.deezer.chart();

				if (!value?.data) {
					return;
				}

				const list = Array.isArray(value.data) ? value.data : (value.data as any).data;

				if (!Array.isArray(list) || list.length === 0) {
					return;
				}

				const validTracks = list.filter((track: DeezerTrack) => typeof track.album?.cover_medium === 'string');

				setTracks(validTracks);
			} catch (error) {
				console.error('[SearchPage] failed to fetch tracks', error);
			} finally {
				setTracksLoading(false);
			}
		};

		fetchTracks();
	}, []);

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

				<SeparatorFull />

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
							<React.Fragment key={playlist.id}>
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
								</LiquidGlass>
							</React.Fragment>
						))}
					</ScrollView>
				</View>

				<SeparatorFull />

				<ThemedText style={homeStyles.sectionTitle}>Songs</ThemedText>

				<View style={homeStyles.songSection}>
					<View style={homeStyles.songListShell}>
						<LinearGradient
							colors={['rgba(10, 12, 18, 0.95)', 'rgba(10, 12, 18, 0.4)', 'transparent']}
							locations={[0, 0, 0.2]}
							style={homeStyles.songListFade}
							pointerEvents="none"
						/>

						{tracksLoading ? (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />

								<ThemedText style={styles.loadingText}>Loading songs...</ThemedText>
							</View>
						) : (
							<ScrollView
								style={homeStyles.songListScroll}
								contentContainerStyle={homeStyles.songListContent}
								showsVerticalScrollIndicator={true}
								bounces={true}
							>
								{tracks.map((song, index) => (
									<SongDisplay
										key={`${song.id}-${index}`}
										song={song}
										onPress={() => {
											setPopup({
												type: 'song',
												song,
											});
										}}
										onArtistPress={(artistId) => {
											setPopup({
												type: 'artist',
												id: String(artistId),
											});
										}}
										onAlbumPress={(albumId) => {
											setPopup({
												type: 'album',
												id: String(albumId),
											});
										}}
									/>
								))}
							</ScrollView>
						)}
					</View>
				</View>
			</View>

			{popup && (
				<Popup onClose={() => setPopup(null)}>
					{/* SONG */}
					{popup.type === 'song' && (
						<SongProfile
							song={popup.song}
							onArtistPress={(artistId) => {
								setPopup({
									type: 'artist',
									id: String(artistId),
								});
							}}
							onAlbumPress={(albumId) => {
								setPopup({
									type: 'album',
									id: String(albumId),
								});
							}}
						/>
					)}

					{/* ARTIST */}
					{popup.type === 'artist' && (
						<ArtistProfile
							id={popup.id}
							onSongPress={(song) => {
								setPopup({
									type: 'song',
									song,
								});
							}}
							onAlbumPress={(album) => {
								setPopup({
									type: 'album',
									id: String(album.id),
								});
							}}
						/>
					)}

					{/* ALBUM */}
					{popup.type === 'album' && (
						<AlbumProfile
							id={popup.id}
							onSongPress={(song) => {
								setPopup({
									type: 'song',
									song,
								});
							}}
							onArtistPress={(artistId) => {
								setPopup({
									type: 'artist',
									id: String(artistId),
								});
							}}
						/>
					)}
				</Popup>
			)}
		</View>
	);
}

const styles = {
	loadingContainer: {
		flex: 1,
		alignItems: 'center' as const,
		justifyContent: 'center' as const,
		gap: 10,
		minHeight: 180,
	},

	loadingText: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.5)',
	},
};
