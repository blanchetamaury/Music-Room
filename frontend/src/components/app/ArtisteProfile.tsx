import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';

import { setTracks as setDebugTracks, setProfile } from '@/src/utils/debug';

import { ThemedText } from '../themed-text';
import { SeparatorFull } from '../ui/separator';
import { AlbumDisplay } from './AlbumDisplay';
import { DeezerAlbum, DeezerArtist, DeezerTrack } from '@/src/types/deezer/deezer';

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
					setDebugTracks(topTracksResponse.data);
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

	useEffect(() => {
		setProfile(artist);
	}, [artist]);

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
