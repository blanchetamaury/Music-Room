import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { api, DeezerAlbum, DeezerArtist, DeezerTrack } from '@/src/lib/fetcher/api/client';
import { setTracks as setDebugTracks, setProfile } from '@/src/utils/debug';
import { SeparatorFull } from '../ui/separator';
import { ThemedText } from '../utils/themed-text';
import { AlbumDisplay } from './AlbumDisplay';
import { SongDisplayMobile } from './SongDisplayMobile';
import { styles } from './ArtisteProfileMobile.style';

interface ArtistProfileProps {
	id: string;
	onSongPress?: (song: DeezerTrack) => void;
	onAlbumPress?: (album: DeezerAlbum) => void;
}

type ArtistTab = 'tracks' | 'albums';

const DEBUG = true;

const debugBox = (color: string) => {
	if (!DEBUG) {
		return {};
	}

	return {
		borderWidth: 2,
		borderColor: color,
		backgroundColor: `${color}22`,
	};
};

export function ArtistProfileMobile({ id, onSongPress, onAlbumPress }: ArtistProfileProps) {
	const [artist, setArtist] = useState<DeezerArtist | null>(null);
	const [tracks, setTracks] = useState<DeezerTrack[]>([]);
	const [albums, setAlbums] = useState<DeezerAlbum[]>([]);
	const [activeTab, setActiveTab] = useState<ArtistTab>('tracks');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const fetchArtist = async () => {
			try {
				setLoading(true);
				setError(null);

				console.log('[ArtistProfileMobile] fetching artist:', id);

				const artistResponse = await api.deezer.artist.artist(id);

				console.log('[ArtistProfileMobile] artist response:', JSON.stringify(artistResponse, null, 2));

				if (!artistResponse?.data) {
					console.warn('[ArtistProfileMobile] No artist returned');

					if (isMounted) {
						setError('No artist returned');
					}

					return;
				}

				const artistData = artistResponse.data;

				const [topTracksResponse, albumsResponse] = await Promise.all([
					api.deezer.artistTopTracks(id),
					api.deezer.artistAlbums(id),
				]);

				const artistTracks = topTracksResponse?.data ?? [];
				const artistAlbums = albumsResponse?.data ?? [];

				if (!isMounted) {
					return;
				}

				setArtist(artistData);
				setTracks(artistTracks);
				setAlbums(artistAlbums);

				setDebugTracks(artistTracks);
				setProfile(artistData);
			} catch (error) {
				console.error('[ArtistProfileMobile] failed to fetch artist:', error);

				if (isMounted) {
					setError('Failed to load artist');
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		fetchArtist();

		return () => {
			isMounted = false;
		};
	}, [id]);

	if (loading) {
		return (
			<View style={[styles.loadingContainer, debugBox('#ff0000')]}>
				<ThemedText style={styles.loading}>Chargement...</ThemedText>
			</View>
		);
	}

	if (error || !artist) {
		return (
			<View style={[styles.loadingContainer, debugBox('#ff0000')]}>
				<ThemedText style={styles.errorText}>{error ?? 'Aucune donnée'}</ThemedText>
			</View>
		);
	}

	const picture = artist.pictureMedium ?? artist.pictureBig ?? artist.pictureSmall ?? null;

	return (
		<View style={[styles.container, debugBox('#ff0000')]}>
			<View style={[styles.header, debugBox('#ff8800')]}>
				<View style={[styles.avatarContainer, debugBox('#00ff00')]}>
					{picture ? (
						<Image
							source={{ uri: picture }}
							resizeMode="cover"
							style={[styles.avatar, debugBox('#00ffff')]}
						/>
					) : (
						<View style={[styles.avatarPlaceholder, debugBox('#00ffff')]} />
					)}
				</View>

				<View style={[styles.artistInfo, debugBox('#0088ff')]}>
					<ThemedText style={[styles.name, debugBox('#ffff00')]} numberOfLines={2}>
						{artist.name ?? 'Unknown artist'}
					</ThemedText>

					<View style={[styles.artistStats, debugBox('#ff00ff')]}>
						{artist.nbFan != null && <InfoItem>{artist.nbFan.toLocaleString()} fans</InfoItem>}

						{artist.nbFan != null && albums.length > 0 && <ThemedText style={styles.dot}>●</ThemedText>}

						<InfoItem>
							{albums.length} {albums.length === 1 ? 'album' : 'albums'}
						</InfoItem>
					</View>
				</View>
			</View>

			<SeparatorFull />

			<View style={[styles.tabs, debugBox('#00ffff')]}>
				<Tab
					label="Top Tracks"
					active={activeTab === 'tracks'}
					count={tracks.length}
					onPress={() => setActiveTab('tracks')}
				/>

				<Tab
					label="Albums"
					active={activeTab === 'albums'}
					count={albums.length}
					onPress={() => setActiveTab('albums')}
				/>
			</View>

			<View style={[styles.content, debugBox('#0088ff')]}>
				{activeTab === 'tracks' ? (
					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={[styles.trackList, debugBox('#00ff88')]}
					>
						{tracks.length === 0 ? (
							<EmptyState text="Aucun morceau trouvé" />
						) : (
							tracks.map((song, index) => (
								<SongDisplayMobile
									key={`${song.deezerCUID}-${index}`}
									song={song}
									onPress={() => onSongPress?.(song)}
								/>
							))
						)}
					</ScrollView>
				) : (
					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={[styles.albumList, debugBox('#00ff88')]}
					>
						{albums.length === 0 ? (
							<EmptyState text="Aucun album trouvé" />
						) : (
							albums.map((album, index) => (
								<View key={`${album.deezerCUID}-${index}`} style={debugBox('#ff8800')}>
									<AlbumDisplay album={album} onPress={() => onAlbumPress?.(album)} />
								</View>
							))
						)}
					</ScrollView>
				)}
			</View>
		</View>
	);
}

function Tab({
	label,
	count,
	active,
	onPress,
}: {
	label: string;
	count: number;
	active: boolean;
	onPress: () => void;
}) {
	return (
		<Pressable
			onPress={onPress}
			style={[styles.tab, active && styles.tabActive, debugBox(active ? '#ffff00' : '#ffffff')]}
		>
			<ThemedText style={[styles.tabText, active && styles.tabTextActive]}>{label}</ThemedText>

			<ThemedText style={[styles.tabCount, active && styles.tabCountActive]}>{count}</ThemedText>
		</Pressable>
	);
}

function InfoItem({ children }: { children: React.ReactNode }) {
	return (
		<View style={[styles.infoItem, debugBox('#00ff88')]}>
			<ThemedText style={styles.infoText}>{children}</ThemedText>
		</View>
	);
}

function EmptyState({ text }: { text: string }) {
	return (
		<View style={[styles.empty, debugBox('#ff0000')]}>
			<ThemedText style={styles.emptyText}>{text}</ThemedText>
		</View>
	);
}
