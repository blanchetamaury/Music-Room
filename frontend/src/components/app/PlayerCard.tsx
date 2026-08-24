import { useAudioPlayer } from 'expo-audio';
import { Pause, Play } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import LiquidGlass from '../LiquidGlass';
import { ThemedText } from '../themed-text';

import { Track } from './data';
import { homeStyles } from './home.styles';

interface PlayerCardProps {
	currentTrack: Track;
}

export function PlayerCard({ currentTrack }: PlayerCardProps) {
	const [currentUrl, setCurrentUrl] = useState<string | null>(
		currentTrack.preview ?? null,
	);

	const [isPlaying, setIsPlaying] = useState(false);

	const player = useAudioPlayer(currentUrl);
	
	useEffect(() => {
		const url = currentTrack.preview ?? null;

		setCurrentUrl(url);
		setIsPlaying(false);
	}, [currentTrack]);

	/*
	 * Lance le morceau courant.
	 */
	const handlePlay = () => {
		if (!currentTrack.preview) {
			console.warn('[PlayerCard] No preview URL');
			return;
		}

		player.play();
		setIsPlaying(true);
	};

	/*
	 * Met le morceau en pause.
	 */
	const handlePause = () => {
		player.pause();
		setIsPlaying(false);
	};

	/*
	 * Play / pause.
	 */
	const handlePlayPause = () => {
		if (isPlaying) {
			handlePause();
		} else {
			handlePlay();
		}
	};

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
							pressed &&
								homeStyles.playPauseButtonPressed,
						]}
						accessibilityRole="button"
						accessibilityLabel={
							isPlaying ? 'Pause' : 'Play'
						}
					>
						{isPlaying ? (
							<Pause
								size={22}
								color="#ffffff"
							/>
						) : (
							<Play
								size={22}
								color="#ffffff"
							/>
						)}
					</Pressable>
				</View>

				<View style={homeStyles.playerInfo}>
					<ThemedText
						style={homeStyles.playerTitle}
					>
						{currentTrack.title}
					</ThemedText>

					<ThemedText
						style={homeStyles.playerArtist}
					>
						{currentTrack.artist}
					</ThemedText>
				</View>

				<View
					style={[
						homeStyles.playerCover,
						{
							backgroundColor:
								currentTrack.cover,
						},
					]}
				/>
			</LiquidGlass>
		</View>
	);
}