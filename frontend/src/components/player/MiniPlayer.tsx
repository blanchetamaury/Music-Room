import { usePlayer } from '@/src/context/PlayerContext';
import { SkipBack, SkipForward, Music4, Pause, Play, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import LiquidGlass from '../utils/LiquidGlass';
import { ThemedText } from '../utils/themed-text';
import { styles } from './MiniPlayer.styles';

const formatTime = (seconds: number): string => {
	if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
	const whole = Math.floor(seconds);
	return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

export function MiniPlayer() {
	const {
		currentTrack,
		queue,
		isPlaying,
		isBuffering,
		progress,
		positionSeconds,
		durationSeconds,
		notice,
		toggle,
		next,
		previous,
		seek,
		dismissNotice,
		isRefreshing,
	} = usePlayer();
	const [trackWidth, setTrackWidth] = useState(0);
	const stripRef = useRef<View>(null);

	if (!currentTrack) {
		if (!notice) return null;
		return (
			<View style={styles.notice} accessibilityLiveRegion="polite">
				<Music4 size={14} color="#fff" />
				<ThemedText style={styles.noticeText}>{notice}</ThemedText>
				<Pressable onPress={dismissNotice} hitSlop={8} accessibilityLabel="Dismiss" accessibilityRole="button">
					<X size={14} color="rgba(255,255,255,0.6)" />
				</Pressable>
			</View>
		);
	}

	const hasQueue = queue.length > 1;

	return (
		<View style={styles.wrapper}>
			<LiquidGlass
				style={styles.bar}
				contentStyle={styles.content}
				intensity={80}
				radius={20}
				topLeftRadius={20}
				topRightRadius={20}
				bottomLeftRadius={20}
				bottomRightRadius={20}
			>
				{currentTrack.cover ? (
					<Image source={{ uri: currentTrack.cover }} style={styles.cover} accessibilityIgnoresInvertColors />
				) : (
					<View style={styles.coverFallback}>
						<Music4 size={20} color="rgba(255,255,255,0.6)" />
					</View>
				)}

				<View style={styles.info}>
					<ThemedText style={styles.title} numberOfLines={1}>
						{currentTrack.title}
					</ThemedText>
					<ThemedText style={styles.artist} numberOfLines={1}>
						{currentTrack.artist}
						{isRefreshing
							? ' · refreshing preview…'
							: isBuffering
								? ' · buffering…'
								: hasQueue
									? ` · ${indexLabel(queue, currentTrack.id)}`
									: ''}
					</ThemedText>
				</View>

				<View style={styles.controls}>
					<Pressable
						onPress={previous}
						disabled={!hasQueue}
						hitSlop={6}
						style={({ pressed }) => [
							styles.controlButton,
							!hasQueue && styles.disabled,
							pressed && styles.controlPressed,
						]}
						accessibilityRole="button"
						accessibilityLabel="Previous track"
					>
						<SkipBack size={20} color="#fff" fill="#fff" />
					</Pressable>

					<Pressable
						onPress={toggle}
						hitSlop={6}
						style={({ pressed }) => [styles.playButton, pressed && styles.playPressed]}
						accessibilityRole="button"
						accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
					>
						{isPlaying ? (
							<Pause size={20} color="#fff" fill="#fff" />
						) : (
							<Play size={20} color="#fff" fill="#fff" />
						)}
					</Pressable>

					<Pressable
						onPress={next}
						disabled={!hasQueue}
						hitSlop={6}
						style={({ pressed }) => [
							styles.controlButton,
							!hasQueue && styles.disabled,
							pressed && styles.controlPressed,
						]}
						accessibilityRole="button"
						accessibilityLabel="Next track"
					>
						<SkipForward size={20} color="#fff" fill="#fff" />
					</Pressable>
				</View>
			</LiquidGlass>

			<Pressable
				onPress={(event) => {
					const { locationX, pageX } = event.nativeEvent;

					if (Number.isFinite(locationX) && trackWidth > 0) {
						seek(locationX / trackWidth);
						return;
					}

					if (!Number.isFinite(pageX) || !stripRef.current) return;
					stripRef.current.measureInWindow((x, width) => {
						if (!Number.isFinite(x) || !Number.isFinite(width) || width <= 0) return;
						seek((pageX - x) / width);
					});
				}}
				disabled={durationSeconds <= 0}
				accessibilityRole="adjustable"
				accessibilityLabel="Seek"
				accessibilityValue={{ min: 0, max: Math.round(durationSeconds), now: Math.round(positionSeconds) }}
			>
				<View
					ref={stripRef}
					style={styles.progressTrack}
					pointerEvents="none"
					onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
				>
					<View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
				</View>
				<View style={styles.timeRow} pointerEvents="none">
					<ThemedText style={styles.time}>{formatTime(positionSeconds)}</ThemedText>
					<ThemedText style={styles.time}>{formatTime(durationSeconds)}</ThemedText>
				</View>
			</Pressable>
		</View>
	);
}

const indexLabel = (queue: { id: string }[], id: string): string => {
	const position = queue.findIndex((track) => track.id === id);
	return position >= 0 ? `${position + 1}/${queue.length}` : '';
};
