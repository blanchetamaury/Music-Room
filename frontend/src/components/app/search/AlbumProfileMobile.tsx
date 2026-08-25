import { useEffect, useState } from 'react';
import {
	Image,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';

import { api } from '@/src/lib/api/client';
import { DeezerAlbum, DeezerTrack } from '@/src/types/deezer/deezer';
import { setTracks as setDebugTracks, setProfile } from '@/src/utils/debug';

import { ThemedText } from '../../themed-text';
import { SeparatorFull } from '../../ui/separator';
import { SongDisplayMobile } from './SongDisplayMobile';

interface AlbumProfileProps {
	id: string;
	onArtistPress?: (artistId: string) => void;
	onSongPress?: (song: DeezerTrack) => void;
}

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

export function AlbumProfileMobile({
	id,
	onArtistPress,
	onSongPress,
}: AlbumProfileProps) {
	const [album, setAlbum] = useState<DeezerAlbum | null>(null);
	const [tracks, setTracks] = useState<DeezerTrack[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const fetchAlbum = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await api.deezer.album();

				if (!response?.data) {
					if (isMounted) {
						setError('No album returned');
					}
					return;
				}

				const data = response.data;
				const albumTracks = data.tracks?.data ?? [];

				if (isMounted) {
					setAlbum(data);
					setTracks(albumTracks);
				}

				setDebugTracks(albumTracks);
				setProfile(data);
			} catch (error) {
				console.error(
					'[AlbumProfile] failed to fetch album:',
					error,
				);

				if (isMounted) {
					setError('Failed to load album');
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		fetchAlbum();

		return () => {
			isMounted = false;
		};
	}, [id]);

	if (loading) {
		return (
			<View
				style={[
					styles.loadingContainer,
					debugBox('#ff0000'),
				]}
			>
				<ThemedText style={styles.loading}>
					Chargement...
				</ThemedText>
			</View>
		);
	}

	if (error || !album) {
		return (
			<View
				style={[
					styles.loadingContainer,
					debugBox('#ff0000'),
				]}
			>
				<ThemedText>
					{error ?? 'Aucune donnée'}
				</ThemedText>
			</View>
		);
	}

	const cover =
		album.coverMedium ??
		album.coverBig ??
		album.cover ??
		null;

	return (
		<View
			style={[
				styles.container,
				debugBox('#ff0000'),
			]}
		>
			<View
				style={[
					styles.header,
					debugBox('#ff8800'),
				]}
			>
				<View
					style={[
						styles.coverContainer,
						debugBox('#00ff00'),
					]}
				>
					{cover ? (
						<Image
							source={{ uri: cover }}
							resizeMode="cover"
							style={[
								styles.cover,
								debugBox('#00ffff'),
							]}
						/>
					) : (
						<View
							style={[
								styles.coverPlaceholder,
								debugBox('#00ffff'),
							]}
						/>
					)}
				</View>

				<View
					style={[
						styles.info,
						debugBox('#0088ff'),
					]}
				>
					<ThemedText
						style={[
							styles.title,
							debugBox('#ffff00'),
						]}
						numberOfLines={2}
					>
						{album.title}
					</ThemedText>

					{album.releaseDate && (
						<View
							style={[
								styles.metadata,
								debugBox('#ff00ff'),
							]}
						>
							<ThemedText
								style={styles.metadataText}
							>
								{formatDate(
									album.releaseDate.toString(),
								)}
							</ThemedText>
						</View>
					)}
				</View>
			</View>

			<SeparatorFull />

			<View
				style={[
					styles.stats,
					debugBox('#00ffff'),
				]}
			>
				{album.label && (
					<View
						style={[
							styles.statItem,
							debugBox('#ff8800'),
						]}
					>
						<ThemedText style={styles.stat}>
							{album.label}
						</ThemedText>
					</View>
				)}

				{album.label && (
					<ThemedText style={styles.dot}>
						●
					</ThemedText>
				)}

				{album.fans != null && (
					<ThemedText style={styles.dot}>
						●
					</ThemedText>
				)}

				{album.fans != null && (
					<View
						style={[
							styles.statItem,
							debugBox('#ff00ff'),
						]}
					>
						<ThemedText style={styles.stat}>
							{album.fans.toLocaleString()} fans
						</ThemedText>
					</View>
				)}

				{album.nbTracks != null && (
					<>
						{(album.fans != null) && (
							<ThemedText style={styles.dot}>
								●
							</ThemedText>
						)}

						<View
							style={[
								styles.statItem,
								debugBox('#8800ff'),
							]}
						>
							<ThemedText style={styles.stat}>
								{album.nbTracks.toLocaleString()} tracks
							</ThemedText>
						</View>
					</>
				)}
			</View>

			<View
				style={[
					styles.trackHeader,
					debugBox('#0088ff'),
				]}
			>
				<ThemedText style={styles.trackTitle}>
					Tracks
				</ThemedText>

				<ThemedText style={styles.trackCount}>
					{tracks.length}
				</ThemedText>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={[
					styles.trackList,
					debugBox('#00ff88'),
				]}
			>
				{tracks.map((song, index) => (
					<SongDisplayMobile
						key={`${song.id}-${index}`}
						song={song}
						onPress={() => {
							onSongPress?.(song);
						}}
					/>
				))}
			</ScrollView>
		</View>
	);
}

function formatDate(date?: string) {
	if (!date) {
		return 'Unknown date';
	}

	const parsed = new Date(date);

	if (Number.isNaN(parsed.getTime())) {
		return date;
	}

	return parsed.toLocaleDateString('fr-FR', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		flex: 1,
		padding: 28,
	},

	header: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'flex-start',
	},

	coverContainer: {
		width: 180,
		height: 180,
		marginRight: 24,
	},

	cover: {
		width: 180,
		height: 180,
		borderRadius: 18,
	},

	coverPlaceholder: {
		width: 180,
		height: 180,
		borderRadius: 18,
		backgroundColor: 'rgba(255,255,255,0.1)',
	},

	info: {
		flex: 1,
		justifyContent: 'center',
		paddingTop: 8,
	},

	title: {
		fontSize: 28,
		fontWeight: '700',
		marginBottom: 10,
	},

	artist: {
		fontSize: 16,
		color: 'rgba(255,255,255,0.8)',
		marginBottom: 14,
	},

	metadata: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 8,
	},

	metadataText: {
		fontSize: 14,
		color: 'rgba(255,255,255,0.55)',
	},

	stats: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		justifyContent: 'center',
		gap: 10,
		marginTop: 18,
		marginBottom: 20,
	},

	statItem: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	stat: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.6)',
	},

	dot: {
		fontSize: 6,
		color: 'rgba(255,255,255,0.35)',
	},

	trackHeader: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
		gap: 8,
	},

	trackTitle: {
		fontSize: 18,
		fontWeight: '700',
	},

	trackCount: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.45)',
	},

	trackList: {
		gap: 8,
		paddingBottom: 20,
	},

	loadingContainer: {
		width: '100%',
		flex: 1,
		padding: 32,
		justifyContent: 'center',
		alignItems: 'center',
	},

	loading: {
		color: 'rgba(255,255,255,0.5)',
	},
});