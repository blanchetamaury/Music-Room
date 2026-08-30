import {
	Banana,
	Clock3,
	FaceAngry,
	FaceNeutral,
	FaceSlightlyFrowningIcon,
	FaceSlightlySmiling,
	FaceSlightlySmilingPlus,
	Heart,
	ListPlus,
	Play,
	TrendingUp,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { api } from '@/src/lib/api/client';
import { DeezerTrack } from '@/src/types/deezer/deezer';
import { ThemedText } from '../../themed-text';
import { HoverText } from '../../ui/hoverText';
import { SeparatorFull } from '../../ui/separator';
import { Track } from '@/src/types/track/track';
import { OutputTrackDeezer } from '@/src/types/deezer/OutputDeezerTrack';

interface SongProfileProps {
	song: OutputTrackDeezer;
	onPlay?: () => void;
	onArtistPress?: (artistId: string | number) => void;
	onAlbumPress?: (albumId: string | null) => void;
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

export function SongProfileMobile({ song, onPlay, onArtistPress, onAlbumPress }: SongProfileProps) {
	const [music, setMusic] = useState<Track | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const loadMusic = async () => {
			try {
				setLoading(true);
				setError(null);

				const data = await api.deezer.music.music(Number(song.deezerCUID));

				const track = data.data;

				if (!track) {
					if (isMounted) {
						setError('No track returned');
					}
					return;
				}

				if (isMounted) {
					setMusic(track);
				}
			} catch (error) {
				console.error('[SongProfile] Failed to load track:', error);

				if (isMounted) {
					setError('Failed to load track');
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		loadMusic();

		return () => {
			isMounted = false;
		};
	}, [song.deezerCUID]);

	if (loading) {
		return (
			<View style={[styles.container, debugBox('#ff0000')]}>
				<ThemedText>Chargement...</ThemedText>
			</View>
		);
	}

	if (error || !music) {
		return (
			<View style={[styles.container, debugBox('#ff0000')]}>
				<ThemedText>{error ?? 'Aucune donnée'}</ThemedText>
			</View>
		);
	}

	const albumName = music.album?.title ?? 'Album';

	return (
		<View style={[styles.container, debugBox('#ff0000')]}>
			<Pressable
				style={[styles.albumButton, debugBox('#ff8800')]}
				onPress={() => {
					onAlbumPress?.(music.album?.deezerCUID ?? null);
				}}
			>
				<ThemedText style={[styles.albumTitle, debugBox('#ffff00')]} numberOfLines={1} ellipsizeMode="tail">
					{albumName}
				</ThemedText>
			</Pressable>

			<View style={[styles.coverContainer, debugBox('#00ff00')]}>
				{music.album?.coverMedium && (
					<Image
						source={{
							uri: music.album.coverMedium,
						}}
						resizeMode="cover"
						style={[styles.cover, debugBox('#00ffff')]}
					/>
				)}
			</View>

			<View style={[styles.titleContainer, debugBox('#0088ff')]}>
				<ScrollingTitle title={music.title} explicit={music.explicit === true} />
			</View>

			<View style={[styles.artistsContainer, debugBox('#ff00ff')]}>
				{music.artists.map((artist, index) => (
					<View key={`${artist.deezerCUID}-${index}`} style={[styles.artistWrapper, debugBox('#8800ff')]}>
						<HoverText
							style={[styles.artist, debugBox('#00ff88')]}
							onPress={() => {
								onArtistPress?.(artist.deezerCUID ?? '');
							}}
						>
							{artist.name}
						</HoverText>

						{index < music.artists.length - 1 && (
							<ThemedText style={[styles.artistSeparator, debugBox('#ffffff')]}>,</ThemedText>
						)}
					</View>
				))}
			</View>

			<SeparatorFull />

			<View style={[styles.actions, debugBox('#25fc09')]}>
				<Pressable
					style={[styles.actionButton, debugBox('#ff0000')]}
					onPress={() => {
						console.log('[SongProfile] Like:', music.deezerCUID);
					}}
				>
					<Heart size={22} color="rgba(255,255,255,0.8)" strokeWidth={2} />
				</Pressable>

				<Pressable
					style={[styles.playButton, debugBox('#00ff00')]}
					onPress={() => {
						console.log('[SongProfile] Play:', music.deezerCUID);

						onPlay?.();
					}}
				>
					<Play size={23} color="#fff" fill="#fff" strokeWidth={2} />
				</Pressable>

				<Pressable
					style={[styles.actionButton, debugBox('#0088ff')]}
					onPress={() => {
						console.log('[SongProfile] Add to playlist:', music.deezerCUID);
					}}
				>
					<ListPlus size={23} color="rgba(255,255,255,0.8)" strokeWidth={2} />
				</Pressable>
			</View>

			<SeparatorFull />

			<View style={[styles.stats, debugBox('#00ffff')]}>
				<View style={[styles.statItem, debugBox('#ff8800')]}>
					<ThemedText style={styles.statLabel}>{formatReleaseDate(music.releaseDate?.toString())}</ThemedText>
				</View>

				<View style={[styles.statSeparator, debugBox('#ffffff')]} />

				<View style={[styles.statItem, debugBox('#00ff00')]}>
					<Clock3 size={15} color="rgba(255,255,255,0.55)" />

					<ThemedText style={styles.statLabel}>{formatDuration(music.duration)}</ThemedText>
				</View>

				<View style={[styles.statSeparator, debugBox('#ffffff')]} />

				<View style={[styles.statItem, debugBox('#ff00ff')]}>
					<TrendingUp size={15} color="rgba(255,255,255,0.55)" />

					<ThemedText style={styles.statLabel}>Trending</ThemedText>

					{getRankIcon(music.rank)}
				</View>
			</View>
		</View>
	);
}

function getRankIcon(rank?: number | null) {
	if (!rank) {
		return null;
	}

	const n = Number(rank);

	if (n < 200_000) {
		return <FaceAngry size={17} color="rgba(255,255,255,0.45)" />;
	}

	if (n < 400_000) {
		return <FaceSlightlyFrowningIcon size={17} color="rgba(255,255,255,0.55)" />;
	}

	if (n < 600_000) {
		return <FaceNeutral size={17} color="rgba(255,255,255,0.65)" />;
	}

	if (n < 800_000) {
		return <FaceSlightlySmiling size={17} color="rgba(255,255,255,0.75)" />;
	}

	return <FaceSlightlySmilingPlus size={17} color="rgba(255,255,255,0.9)" />;
}

function formatReleaseDate(date?: string) {
	if (!date) {
		return 'Unknown date';
	}

	const parsedDate = new Date(date);

	if (Number.isNaN(parsedDate.getTime())) {
		return date;
	}

	return parsedDate.toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
}

function formatDuration(duration?: string | number) {
	if (!duration) {
		return '--:--';
	}

	const totalSeconds = Number(duration);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function ScrollingTitle({ title, explicit }: { title: string; explicit: boolean }) {
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
			style={[styles.scrollingTitleWrapper, !isOverflowing && styles.scrollingTitleCentered]}
			onLayout={(event) => {
				setContainerWidth(event.nativeEvent.layout.width);
			}}
		>
			<ScrollView
				ref={scrollRef}
				horizontal
				showsHorizontalScrollIndicator={false}
				scrollEnabled={false}
				contentContainerStyle={[styles.titleScrollContent, !isOverflowing && styles.titleScrollCentered]}
			>
				<View
					style={styles.titleContent}
					onLayout={(event) => {
						setContentWidth(event.nativeEvent.layout.width);
					}}
				>
					<ThemedText style={styles.title}>{title}</ThemedText>

					{explicit && <Banana size={18} color="rgba(255,255,255,0.7)" />}
				</View>

				{isOverflowing && (
					<View style={styles.titleDuplicate}>
						<ThemedText style={styles.title}>{title}</ThemedText>

						{explicit && <Banana size={18} color="rgba(255,255,255,0.7)" />}
					</View>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		padding: 28,
		alignItems: 'center',
	},

	albumButton: {
		width: '100%',
		alignItems: 'center',
		marginBottom: 20,
	},

	albumTitle: {
		fontSize: 16,
		fontWeight: '500',
		color: 'rgba(255,255,255,0.7)',
	},

	coverContainer: {
		width: 220,
		height: 220,
		alignItems: 'center',
		justifyContent: 'center',
	},

	cover: {
		width: 220,
		height: 220,
		borderRadius: 20,
	},

	titleContainer: {
		width: '100%',
		marginTop: 22,
		justifyContent: 'center',
	},

	scrollingTitleWrapper: {
		width: '100%',
		overflow: 'hidden',
		alignItems: 'center',
	},

	scrollingTitleCentered: {
		alignItems: 'center',
	},

	titleScrollContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	titleScrollCentered: {
		justifyContent: 'center',
	},

	titleContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},

	titleDuplicate: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginLeft: 40,
	},

	title: {
		fontSize: 24,
		fontWeight: '700',
		color: '#fff',
	},

	artistsContainer: {
		width: '100%',
		marginTop: 10,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		alignItems: 'center',
	},

	artistWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	artist: {
		fontSize: 15,
		color: 'rgba(255,255,255,0.65)',
	},

	artistSeparator: {
		marginHorizontal: 5,
		fontSize: 14,
		color: 'rgba(255,255,255,0.35)',
	},

	actions: {
		width: '100%',
		marginTop: 18,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
	},

	actionButton: {
		width: 42,
		height: 42,
		borderRadius: 21,
		alignItems: 'center',
		justifyContent: 'center',
	},

	playButton: {
		width: 52,
		height: 52,
		borderRadius: 26,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.15)',
	},

	stats: {
		width: '100%',
		marginTop: 18,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
	},

	statItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
	},

	statLabel: {
		fontSize: 12,
		color: 'rgba(255,255,255,0.55)',
	},

	statSeparator: {
		width: 1,
		height: 12,
		backgroundColor: 'rgba(255,255,255,0.2)',
	},
});
