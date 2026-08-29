import { useAudioPlayer } from 'expo-audio';
import { Pause, Play } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import LiquidGlass from '../LiquidGlass';
import { ThemedText } from '../themed-text';
import { homeStyles } from './home.styles';
import { OutputTrackDeezer } from '@/src/types/deezer/OutputDeezerTrack';

interface PlayerCardProps {
	currentTrack: OutputTrackDeezer;
	autoPlay?: boolean;
	onAutoPlayHandled?: () => void;
}

export function PlayerCard({ currentTrack, autoPlay = true, onAutoPlayHandled }: PlayerCardProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const player = useAudioPlayer(currentTrack.previewUrl);
	const previousTrackId = useRef<string | null>(null);

	useEffect(() => {
		if (!currentTrack.previewUrl) {
			setIsPlaying(false);
			return;
		}

		if (previousTrackId.current === currentTrack.deezerCUID) {
			return;
		}

		previousTrackId.current = currentTrack.deezerCUID;

		setIsPlaying(false);

		if (!autoPlay) {
			onAutoPlayHandled?.();
			return;
		}

		const timeout = setTimeout(() => {
			try {
				player.play();
				setIsPlaying(true);
			} catch (error) {
				console.error('[PlayerCard] Failed to autoplay:', error);
			}

			onAutoPlayHandled?.();
		}, 50);

		return () => clearTimeout(timeout);
	}, [currentTrack.deezerCUID, currentTrack.previewUrl, autoPlay, player, onAutoPlayHandled]);

	const handlePlay = () => {
		if (!currentTrack.previewUrl) {
			console.warn('[PlayerCard] No preview URL');
			return;
		}

		try {
			player.play();
			setIsPlaying(true);
		} catch (error) {
			console.error('[PlayerCard] Failed to play:', error);
		}
	};

	const handlePause = () => {
		player.pause();
		setIsPlaying(false);
	};

	const handlePlayPause = () => {
		if (isPlaying) {
			handlePause();
		} else {
			handlePlay();
		}
	};

	const artists = currentTrack.artist[0].name ?? 'Unknown artist';

	return (
		<View style={homeStyles.playerWrap}>
			<LiquidGlass
				style={homeStyles.playerCard}
				contentStyle={homeStyles.playerContent}
				intensity={50}
				radius={22}
				topLeftRadius={22}
				topRightRadius={22}
				bottomLeftRadius={22}
				bottomRightRadius={22}
			>
				<View style={homeStyles.playerControls}>
					<Pressable
						onPress={handlePlayPause}
						style={({ pressed }) => [
							homeStyles.playPauseButtonInner,
							pressed && homeStyles.playPauseButtonPressed,
						]}
						accessibilityRole="button"
						accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
					>
						{isPlaying ? <Pause size={22} color="#ffffff" /> : <Play size={22} color="#ffffff" />}
					</Pressable>
				</View>

				<View style={homeStyles.playerInfo}>
					<ScrollingText text={currentTrack.title} style={homeStyles.playerTitle} />

					<ThemedText style={homeStyles.playerArtist}>{artists}</ThemedText>
				</View>

				{currentTrack.album.CoverMedium ? (
					<Image
						source={{
							uri: currentTrack.album.CoverMedium,
						}}
						resizeMode="cover"
						style={[
							homeStyles.playerCover,
							{
								backgroundColor: 'rgba(53, 184, 71, 0.1)',
							},
						]}
					/>
				) : (
					<View
						style={[
							homeStyles.playerCover,
							{
								backgroundColor: 'rgba(53, 184, 71, 0.1)',
							},
						]}
					/>
				)}
			</LiquidGlass>
		</View>
	);
}

interface ScrollingTextProps {
	text: string;
	style?: any;
}

function ScrollingText({ text, style }: ScrollingTextProps) {
	const scrollRef = useRef<ScrollView>(null);

	const [containerWidth, setContainerWidth] = useState(0);
	const [textWidth, setTextWidth] = useState(0);

	const animationFrame = useRef<number | null>(null);
	const position = useRef(0);

	const isOverflowing = containerWidth > 0 && textWidth > containerWidth;

	useEffect(() => {
		position.current = 0;

		if (animationFrame.current !== null) {
			cancelAnimationFrame(animationFrame.current);
			animationFrame.current = null;
		}

		scrollRef.current?.scrollTo({
			x: 0,
			animated: false,
		});

		if (!isOverflowing) {
			return;
		}

		const speed = 0.4;
		const gap = 40;

		let lastTime = performance.now();

		const animate = (time: number) => {
			const delta = time - lastTime;
			lastTime = time;

			position.current += speed * (delta / 16.67);

			const loopWidth = textWidth + gap;

			if (position.current >= loopWidth) {
				position.current = 0;
			}

			scrollRef.current?.scrollTo({
				x: position.current,
				animated: false,
			});

			animationFrame.current = requestAnimationFrame(animate);
		};

		const timeout = setTimeout(() => {
			animationFrame.current = requestAnimationFrame(animate);
		}, 1000);

		return () => {
			clearTimeout(timeout);

			if (animationFrame.current !== null) {
				cancelAnimationFrame(animationFrame.current);
				animationFrame.current = null;
			}
		};
	}, [isOverflowing, textWidth, text]);

	return (
		<View
			style={styles.scrollingTextContainer}
			onLayout={(event) => {
				setContainerWidth(event.nativeEvent.layout.width);
			}}
		>
			<ScrollView
				ref={scrollRef}
				horizontal
				scrollEnabled={false}
				showsHorizontalScrollIndicator={false}
				bounces={false}
				contentContainerStyle={styles.scrollingContent}
			>
				<View
					style={styles.textRow}
					onLayout={(event) => {
						setTextWidth(event.nativeEvent.layout.width);
					}}
				>
					<ThemedText style={style} numberOfLines={1}>
						{text}
					</ThemedText>
				</View>

				{isOverflowing && (
					<View style={styles.textRowDuplicate}>
						<ThemedText style={style} numberOfLines={1}>
							{text}
						</ThemedText>
					</View>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	scrollingTextContainer: {
		width: '100%',
		overflow: 'hidden',
	},

	scrollingContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	textRow: {
		flexDirection: 'row',
		alignItems: 'center',
		flexShrink: 0,
	},

	textRowDuplicate: {
		flexDirection: 'row',
		alignItems: 'center',
		flexShrink: 0,
		marginLeft: 40,
	},
});
