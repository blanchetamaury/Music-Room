import { usePlayer } from '@/src/context/PlayerContext';
import { PlaylistOutput } from '@/src/types/playlist/PlaylistOutput';
import { ThemedText } from '@/src/components/utils/themed-text';
import { toPlayerTrack } from '@/src/types/player/PlayerTrack';
import { Music4, Pause, Play } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, View } from 'react-native';
import LiquidGlass from '../utils/LiquidGlass';
import { styles } from './HomeSections.styles';

interface QueuePanelProps {
	playlist: PlaylistOutput | null;
	isLoading: boolean;
	error: Error | null;
	onRetry: () => void;
}

export function QueuePanel({ playlist, isLoading, error, onRetry }: QueuePanelProps) {
	const { playQueue, currentTrack, isPlaying, toggle, notice, dismissNotice } = usePlayer();

	return (
		<View style={styles.section}>
			<LiquidGlass
				style={styles.panel}
				contentStyle={styles.panelContent}
				intensity={18}
				radius={16}
				topLeftRadius={16}
				topRightRadius={16}
				bottomLeftRadius={16}
				bottomRightRadius={16}
			>
				<View style={styles.header}>
					<ThemedText style={styles.title}>Up next</ThemedText>
					{playlist ? <ThemedText style={styles.count}>{playlist.tracks.length} tracks</ThemedText> : null}
				</View>

				{isLoading ? (
					<View style={styles.centered}>
						<ActivityIndicator color="#fff" />
						<ThemedText style={styles.stateText}>Loading your playlists…</ThemedText>
					</View>
				) : error ? (
					<View style={styles.centered}>
						<ThemedText style={[styles.stateText, styles.stateTextError]}>
							{error.message || 'Could not load your playlists.'}
						</ThemedText>
						<Pressable onPress={onRetry} style={styles.actionButton} accessibilityRole="button">
							<ThemedText style={styles.actionText}>Retry</ThemedText>
						</Pressable>
					</View>
				) : !playlist ? (
					<View style={styles.centered}>
						<Music4 size={20} color="rgba(255,255,255,0.5)" />
						<ThemedText style={styles.stateText}>
							You have no playlist yet. Create one from the search tab, then come back.
						</ThemedText>
					</View>
				) : playlist.tracks.length === 0 ? (
					<View style={styles.centered}>
						<Music4 size={20} color="rgba(255,255,255,0.5)" />
						<ThemedText style={styles.stateText}>
							“{playlist.name}” is empty. Add a track from the search tab.
						</ThemedText>
					</View>
				) : (
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.queueRow}
					>
						{playlist.tracks.map((entry, index) => {
							const played = toPlayerTrack(entry);
							const active = currentTrack?.id === entry.trackId;
							const cover = played?.cover ?? null;
							const unplayable = !played?.previewUrl;

							return (
								<Pressable
									key={entry.id}
									onPress={() => (active ? toggle() : playQueue(playlist.tracks, index))}
									style={({ pressed }) => [
										styles.queueCard,
										active && styles.queueCardActive,
										pressed && { opacity: 0.7 },
									]}
									accessibilityRole="button"
									accessibilityLabel={`${index + 1}. ${played?.title ?? 'Unavailable track'}${
										played ? ` by ${played.artist}` : ''
									}`}
									accessibilityHint={unplayable ? 'No preview available' : 'Plays this track'}
								>
									{cover ? (
										<Image
											source={{ uri: cover }}
											style={styles.queueCover}
											accessibilityIgnoresInvertColors
										/>
									) : (
										<View style={styles.queueCoverFallback}>
											<Music4 size={22} color="rgba(255,255,255,0.45)" />
										</View>
									)}

									<ThemedText style={styles.queueIndex} accessibilityElementsHidden>
										{index + 1}
									</ThemedText>

									{active ? (
										<View style={styles.queuePlayBadge}>
											{isPlaying ? (
												<Pause size={13} color="#fff" fill="#fff" />
											) : (
												<Play size={13} color="#fff" fill="#fff" />
											)}
										</View>
									) : null}

									<ThemedText style={styles.trackTitle} numberOfLines={1}>
										{played?.title ?? 'Unavailable'}
									</ThemedText>
									<ThemedText style={styles.trackArtist} numberOfLines={1}>
										{played ? played.artist : 'Deezer has no preview'}
									</ThemedText>
								</Pressable>
							);
						})}
					</ScrollView>
				)}

				{notice ? (
					<View style={styles.centered}>
						<ThemedText style={styles.stateText}>{notice}</ThemedText>
						<Pressable onPress={dismissNotice} style={styles.actionButton} accessibilityRole="button">
							<ThemedText style={styles.actionText}>Got it</ThemedText>
						</Pressable>
					</View>
				) : null}
			</LiquidGlass>
		</View>
	);
}
