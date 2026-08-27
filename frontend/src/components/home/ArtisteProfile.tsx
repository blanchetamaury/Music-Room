import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { api, DeezerAlbum, DeezerArtist, DeezerTrack } from '@/src/lib/api/client';

import { ThemedText } from '../themed-text';
import { SeparatorFull } from '../ui/separator';
import { AlbumDisplay } from './AlbumDisplay';
import { SongDisplay } from './SongDisplay';

interface ArtistProfileProps {
	id: string;
	onSongPress?: (song: DeezerTrack) => void;
	onAlbumPress?: (album: DeezerAlbum) => void;
}

type ArtistTab = 'tracks' | 'albums';

export function ArtistProfile({ id, onSongPress, onAlbumPress }: ArtistProfileProps) {
	const [artist, setArtist] = useState<DeezerArtist | undefined>();
	const [tracks, setTracks] = useState<DeezerTrack[]>([]);
	const [albums, setAlbums] = useState<DeezerAlbum[]>([]);
	const [activeTab, setActiveTab] = useState<ArtistTab>('tracks');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchArtist = async () => {
			try {
				setLoading(true);

				const artistResponse = await api.deezer.artist(id);

				if (!artistResponse) {
					return;
				}

				setArtist(artistResponse.data);

				const [topTracksResponse, albumsResponse] = await Promise.all([
					api.deezer.artistTopTracks(id),
					api.deezer.artistAlbums(id),
				]);

				if (topTracksResponse?.data) {
					setTracks(topTracksResponse.data);
				}

				if (albumsResponse?.data) {
					setAlbums(albumsResponse.data);
				}
			} catch (error) {
				console.error('[ArtistProfile] failed to fetch artist', error);
			} finally {
				setLoading(false);
			}
		};

		fetchArtist();
	}, [id]);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				{artist?.picture_medium ? (
					<Image
						source={{
							uri: artist.picture_medium,
						}}
						style={styles.avatar}
					/>
				) : (
					<View style={styles.avatarPlaceholder} />
				)}

				<View style={styles.artistInfo}>
					<ThemedText style={styles.name}>{artist?.name ?? 'Unknown artist'}</ThemedText>

					<View style={styles.artistStats}>
						<ThemedText style={styles.fans}>
							{artist?.nb_fan ? `${artist.nb_fan.toLocaleString()} fans` : '— fans'}
						</ThemedText>

						<ThemedText style={styles.dot}>●</ThemedText>

						<ThemedText style={styles.fans}>
							{albums.length} {albums.length === 1 ? 'album' : 'albums'}
						</ThemedText>
					</View>
				</View>
			</View>

			<SeparatorFull />

			<View style={styles.tabs}>
				<Pressable
					onPress={() => setActiveTab('tracks')}
					style={[styles.tab, activeTab === 'tracks' && styles.tabActive]}
				>
					<ThemedText style={[styles.tabText, activeTab === 'tracks' && styles.tabTextActive]}>
						Top Tracks
					</ThemedText>
				</Pressable>

				<Pressable
					onPress={() => setActiveTab('albums')}
					style={[styles.tab, activeTab === 'albums' && styles.tabActive]}
				>
					<ThemedText style={[styles.tabText, activeTab === 'albums' && styles.tabTextActive]}>
						Albums
					</ThemedText>
				</Pressable>
			</View>

			<View style={styles.content}>
				{loading ? (
					<ThemedText style={styles.loading}>Loading...</ThemedText>
				) : activeTab === 'tracks' ? (
					<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
						{tracks.map((song, index) => (
							<SongDisplay key={`${song.id}-${index}`} song={song} onPress={() => onSongPress?.(song)} />
						))}
					</ScrollView>
				) : (
					<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.albumList}>
						{albums.map((album) => (
							<AlbumDisplay key={album.id} album={album} onPress={() => onAlbumPress?.(album)} />
						))}
					</ScrollView>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 32,
		flex: 1,
	},

	header: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	avatar: {
		width: 120,
		height: 120,
		borderRadius: 60,
		marginRight: 24,
	},

	avatarPlaceholder: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: 'rgba(255,255,255,0.1)',
		marginRight: 24,
	},

	artistInfo: {
		justifyContent: 'center',
	},

	artistStats: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},

	dot: {
		fontSize: 6,
		color: 'rgba(255,255,255,0.4)',
	},

	name: {
		fontSize: 30,
		fontWeight: '700',
		marginBottom: 8,
	},

	fans: {
		fontSize: 15,
		color: 'rgba(255,255,255,0.6)',
	},

	tabs: {
		flexDirection: 'row',
		marginTop: 20,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255,255,255,0.08)',
	},

	tab: {
		paddingVertical: 10,
		paddingHorizontal: 16,
		marginRight: 8,
	},

	tabActive: {
		borderBottomWidth: 2,
		borderBottomColor: 'rgba(255,255,255,0.9)',
	},

	tabText: {
		fontSize: 14,
		color: 'rgba(255,255,255,0.5)',
	},

	tabTextActive: {
		color: '#fff',
	},

	content: {
		flex: 1,
		marginTop: 16,
	},

	list: {
		gap: 8,
		paddingBottom: 20,
	},

	albumList: {
		gap: 12,
		paddingBottom: 20,
	},

	loading: {
		color: 'rgba(255,255,255,0.5)',
	},
});
