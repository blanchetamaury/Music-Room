import { Clock3 } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
	Image,
	Pressable,
	ScrollView,
	View
} from 'react-native';

import { api } from '@/src/lib/api/client';
import { outputAPITrack } from '@/src/types/album/album';
import { DeezerAlbum } from '@/src/types/deezer/deezer';
import { OutputTrackDeezer } from '@/src/types/deezer/OutputDeezerTrack';
import { setTracks as setDebugTracks, setProfile } from '@/src/utils/debug';
import { ThemedText } from '../../themed-text';
import { HoverText } from '../../ui/hoverText';
import { SeparatorFull } from '../../ui/separator';
import { styles } from './AlbumProfileMobileStyle';

interface AlbumProfileProps {
	id: string;
	onArtistPress?: (artistId: string) => void;
	onSongPress?: (song: OutputTrackDeezer) => void;
}

const DEBUG = false;

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

export function AlbumProfileMobile({ id, onArtistPress, onSongPress }: AlbumProfileProps) {
	const [album, setAlbum] = useState<DeezerAlbum | null>(null);
	const [tracks, setTracks] = useState<outputAPITrack[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const fetchAlbum = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await api.deezer.album.album(id);
				const albumData = response?.data;

				if (!albumData) {
					if (isMounted) setError('No album returned');
					return;
				}

				const albumTracks = [...(albumData.tracks ?? [])].sort((a, b) => {
					if (a.trackPosition == null) return 1;
					if (b.trackPosition == null) return -1;

					return a.trackPosition - b.trackPosition;
				});

				if (isMounted) {
					setAlbum(albumData);
					setTracks(albumTracks);
				}

				setDebugTracks(albumTracks);
				setProfile(albumData);
			} catch (error) {
				error = null;
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
			<View style={[styles.loadingContainer, debugBox('#ff0000')]}>
				<ThemedText style={styles.loading}>Chargement...</ThemedText>
			</View>
		);
	}

	if (error || !album) {
		return (
			<View style={[styles.loadingContainer, debugBox('#ff0000')]}>
				<ThemedText>{error ?? 'Aucune donnée'}</ThemedText>
			</View>
		);
	}

	const cover = album.coverMedium ?? album.coverBig ?? album.cover ?? null;

	const releaseDate = tracks[0]?.releaseDate;
	const albumArtist = getAlbumArtist(album, tracks);

	console.log("[AlbumProfileMobile] albumArtis: ", JSON.stringify(albumArtist));

	return (
		<View style={[styles.container, debugBox('#ff0000')]}>
			<View style={[styles.albumHeader, debugBox('#ff8800')]}>
				<View style={[styles.coverContainer, debugBox('#00ff00')]}>
					{cover ? (
						<Image source={{ uri: cover }} resizeMode="cover" style={[styles.cover, debugBox('#00ffff')]} />
					) : (
						<View style={[styles.coverPlaceholder, debugBox('#ffffff')]} />
					)}
				</View>

				<View
					style={[
						styles.albumInfo,
						debugBox('#0044ff'),
					]}
				>
					<ScrollingTitle
						title={album.title ?? 'Album'}
					/>

					{albumArtist?.name && albumArtist.deezerCUID && (
						<HoverText
							style={[
								styles.albumArtist,
								debugBox('#ffef08'),
							]}
							onPress={() => {
								onArtistPress?.(String(albumArtist.deezerCUID ?? albumArtist.id ?? ''));
							}}
						>
							{"Need to fix"}
						</HoverText>
					)}

					<View style={[styles.albumStats, debugBox('#ff00ff')]}>
						{album.fans != null && <InfoItem>{album.fans.toLocaleString()} fans</InfoItem>}

						{album.duration != null && <InfoItem icon>{formatDuration(album.duration)}</InfoItem>}

						{album.recordType && <InfoItem>{formatRecordType(album.recordType)}</InfoItem>}
					</View>
				</View>
			</View>

			<SeparatorFull />

			<View style={[styles.trackHeader, debugBox('#0088ff')]}>
				<ThemedText style={styles.trackTitle}>Tracks</ThemedText>

				<ThemedText style={styles.trackCount}>{tracks.length}</ThemedText>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={[styles.trackList, debugBox('#00ff88')]}
			>
				{tracks.map((track, index) => (
					<AlbumTrack
						key={`${track.id}-${index}`}
						track={track}
						index={index}
						onPress={() => {
							onSongPress?.(track as unknown as OutputTrackDeezer);
						}}
					/>
				))}
			</ScrollView>

			<SeparatorFull />

			<View style={[styles.footer, debugBox('#ff00ff')]}>
				{releaseDate && (
					<View style={[styles.footerItem, debugBox('#ff8800')]}>
						<ThemedText style={styles.footerLabel}>Sortie</ThemedText>

						<ThemedText style={styles.footerValue}>{formatDate(releaseDate.toString())}</ThemedText>
					</View>
				)}

				{album.label && (
					<View style={[styles.footerItem, debugBox('#00ffff')]}>
						<ThemedText style={styles.footerLabel}>Label</ThemedText>

						<ThemedText style={styles.footerValue} numberOfLines={1}>
							{album.label}
						</ThemedText>
					</View>
				)}
			</View>
		</View>
	);
}

function AlbumTrack({ track, index, onPress }: { track: outputAPITrack; index: number; onPress: () => void }) {
	return (
		<Pressable style={[styles.track, debugBox('#ff8800')]} onPress={onPress}>
			<View style={[styles.trackPositionContainer, debugBox('#00ffff')]}>
				<ThemedText style={styles.trackPosition}>{track.trackPosition ?? index + 1}</ThemedText>
			</View>

			<View style={[styles.trackInfo, debugBox('#ffff00')]}>
				<ThemedText style={styles.trackName} numberOfLines={1}>
					{track.title}
				</ThemedText>
			</View>

			<View style={[styles.trackDuration, debugBox('#ff00ff')]}>
				<ThemedText style={styles.trackDurationText}>{formatDuration(track.duration)}</ThemedText>
			</View>
		</Pressable>
	);
}

function InfoItem({ children, icon = false }: { children: React.ReactNode; icon?: boolean }) {
	return (
		<View style={[styles.infoItem, debugBox('#00ff88')]}>
			{icon && <Clock3 size={14} color="rgba(255,255,255,0.5)" />}

			<ThemedText style={styles.infoText}>{children}</ThemedText>
		</View>
	);
}

function ScrollingTitle({ title }: { title: string }) {
	const scrollRef = useRef<ScrollView>(null);
	const [contentWidth, setContentWidth] = useState(0);
	const [containerWidth, setContainerWidth] = useState(0);

	const isOverflowing = contentWidth > 0 && containerWidth > 0 && contentWidth > containerWidth;

	useEffect(() => {
		if (!isOverflowing) {
			scrollRef.current?.scrollTo({
				x: 0,
				animated: false,
			});

			return;
		}

		let position = 0;
		let animationFrame: number;

		const speed = 0.35;

		const animate = () => {
			position += speed;

			if (position >= contentWidth + 40) {
				position = 0;
			}

			scrollRef.current?.scrollTo({
				x: position,
				animated: false,
			});

			animationFrame = requestAnimationFrame(animate);
		};

		const timeout = setTimeout(() => {
			animationFrame = requestAnimationFrame(animate);
		}, 1000);

		return () => {
			clearTimeout(timeout);
			cancelAnimationFrame(animationFrame);
		};
	}, [isOverflowing, contentWidth]);

	return (
		<View
			style={[styles.titleWrapper, debugBox('#ff0000')]}
			onLayout={(event) => {
				setContainerWidth(event.nativeEvent.layout.width);
			}}
		>
			<ScrollView
				ref={scrollRef}
				horizontal
				scrollEnabled={false}
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={[styles.titleScrollContent, !isOverflowing && styles.titleScrollCentered]}
			>
				<View
					style={styles.titleContent}
					onLayout={(event) => {
						setContentWidth(event.nativeEvent.layout.width);
					}}
				>
					<ThemedText style={[styles.albumTitle, debugBox('#ffff00')]} numberOfLines={1}>
						{title}
					</ThemedText>
				</View>

				{isOverflowing && (
					<View style={[styles.titleDuplicate, debugBox('#00ff00')]}>
						<ThemedText style={styles.albumTitle} numberOfLines={1}>
							{title}
						</ThemedText>
					</View>
				)}
			</ScrollView>
		</View>
	);
}

function getAlbumArtist(
	album: DeezerAlbum,
	tracks: outputAPITrack[],
) {
	console.log("Help: ", JSON.stringify(album, null, 2));
	const albumWithArtist = album as DeezerAlbum & {
		artist?: {
			id?: string | number;
			deezerCUID?: string;
			name?: string;
		};
	};

	if (albumWithArtist.artist?.name) {
		return albumWithArtist.artist;
	}

	const firstTrack = tracks[0] as
		| (outputAPITrack & {
				artist?: {
					id?: string | number;
					deezerCUID?: string;
					name?: string;
				};
		  })
		| undefined;

	if (firstTrack?.artist?.name) {
		return firstTrack.artist;
	}

	return null;
}

function formatRecordType(type?: string) {
	if (!type) {
		return '';
	}

	switch (type.toLowerCase()) {
		case 'single':
			return 'Single';
		case 'ep':
			return 'EP';
		case 'album':
			return 'Album';
		default:
			return type;
	}
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

function formatDuration(duration?: string | number) {
	if (duration == null) {
		return '--:--';
	}

	const totalSeconds = Number(duration);

	if (!Number.isFinite(totalSeconds)) {
		return '--:--';
	}

	const minutes = Math.floor(totalSeconds / 60);
	const seconds = Math.floor(totalSeconds % 60);

	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}