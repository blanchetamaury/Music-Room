import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { api, DeezerAlbum, DeezerTrack, } from '@/src/lib/api/client';

import { ThemedText } from '../themed-text';
import { HoverText } from '../ui/hoverText';
import { SeparatorFull } from '../ui/separator';
import { SongDisplay } from './search/SongDisplay';

interface AlbumProfileProps {
	id: string;

	onArtistPress?: (artistId: string) => void;
	onSongPress?: (song: DeezerTrack) => void;
}

export function AlbumProfile({
	id,
	onArtistPress,
	onSongPress,
}: AlbumProfileProps) {
	const [album, setAlbum] = useState<DeezerAlbum | undefined>();
	const [tracks, setTracks] = useState<DeezerTrack[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchAlbum = async () => {
			try {
				setLoading(true);

				const response = await api.deezer.album(id);

				if (!response) {
					return;
				}

				setAlbum(response.data);

				if (response.data?.tracks?.data) {
					setTracks(response.data.tracks.data);
				}
			} catch (error) {
				console.error(
					'[AlbumProfile] failed to fetch album',
					error,
				);
			} finally {
				setLoading(false);
			}
		};

		fetchAlbum();
	}, [id]);

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ThemedText style={styles.loading}>
					Loading...
				</ThemedText>
			</View>
		);
	}

	if (!album) {
		return (
			<View style={styles.loadingContainer}>
				<ThemedText style={styles.loading}>
					Album not found
				</ThemedText>
			</View>
		);
	}

	const artistName = album.artist?.name ?? 'Unknown artist';
	const artistId = album.artist?.id;

	const genres =
		album.genres?.data
			?.map((genre) => genre.name)
			.join(', ') ?? null;

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				{album.cover_xl ||
				album.cover_big ||
				album.cover_medium ? (
					<Image
						source={{
							uri:
								album.cover_xl ??
								album.cover_big ??
								album.cover_medium,
						}}
						style={styles.cover}
					/>
				) : (
					<View style={styles.coverPlaceholder} />
				)}

				<View style={styles.info}>
					<ThemedText style={styles.title}>
						{album.title}
					</ThemedText>

					{album.artist && (
						<HoverText
							style={styles.artist}
							onPress={() => {
								if (artistId) {
									onArtistPress?.(artistId);
								}
							}}
						>
							{artistName}
						</HoverText>
					)}

					<View style={styles.metadata}>
						{album.release_date && (
							<ThemedText
								style={styles.metadataText}
							>
								{formatDate(
									album.release_date,
								)}
							</ThemedText>
						)}

						{album.release_date &&
							(album.record_type ||
								album.nb_tracks) && (
								<ThemedText style={styles.dot}>
									●
								</ThemedText>
							)}

						{album.record_type && (
							<ThemedText
								style={styles.metadataText}
							>
								{capitalize(album.record_type)}
							</ThemedText>
						)}

						{album.record_type &&
							album.nb_tracks && (
								<ThemedText style={styles.dot}>
									●
								</ThemedText>
							)}

						{album.nb_tracks && (
							<ThemedText
								style={styles.metadataText}
							>
								{album.nb_tracks}{' '}
								{album.nb_tracks === 1
									? 'track'
									: 'tracks'}
							</ThemedText>
						)}
					</View>
				</View>
			</View>

			<SeparatorFull />

			<View style={styles.stats}>
				{album.label && (
					<View style={styles.statItem}>
						<ThemedText style={styles.stat}>
							{album.label}
						</ThemedText>
					</View>
				)}

				{album.label && genres && (
					<ThemedText style={styles.dot}>
						●
					</ThemedText>
				)}

				{genres && (
					<View style={styles.statItem}>
						<ThemedText style={styles.stat}>
							{genres}
						</ThemedText>
					</View>
				)}

				{genres && album.nb_fans && (
					<ThemedText style={styles.dot}>
						●
					</ThemedText>
				)}

				{album.nb_fans && (
					<View style={styles.statItem}>
						<ThemedText style={styles.stat}>
							{album.nb_fans.toLocaleString()}{' '}
							fans
						</ThemedText>
					</View>
				)}
			</View>

			<View style={styles.trackHeader}>
				<ThemedText style={styles.trackTitle}>
					Tracks
				</ThemedText>

				<ThemedText style={styles.trackCount}>
					{tracks.length}
				</ThemedText>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.trackList}
			>
				{tracks.map((song, index) => (
					<SongDisplay
						key={`${song.id}-${index}`}
						song={song}
						onPress={() => onSongPress?.(song)}
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

	return parsed.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

function capitalize(value: string) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
	container: {
		padding: 32,
		flex: 1,
	},

	header: {
		flexDirection: 'row',
		alignItems: 'flex-start',
	},

	cover: {
		width: 180,
		height: 180,
		borderRadius: 18,
		marginRight: 24,
	},

	coverPlaceholder: {
		width: 180,
		height: 180,
		borderRadius: 18,
		backgroundColor: 'rgba(255,255,255,0.1)',
		marginRight: 24,
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

	dot: {
		fontSize: 6,
		color: 'rgba(255,255,255,0.35)',
	},

	stats: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
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

	trackHeader: {
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
		padding: 32,
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},

	loading: {
		color: 'rgba(255,255,255,0.5)',
	},
});