import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Pause, Play } from 'lucide-react';
import LiquidGlass from '../LiquidGlass';
import { ThemedText } from '../themed-text';
import { Track } from './data';
import { homeStyles } from './home.styles';

export function PlayerCard({ currentTrack }: { currentTrack: Track }) {
	const [play, setPlay] = useState(false);
	
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
						onPress={() => setPlay((p) => !p)}
						style={({ pressed }) => [
							homeStyles.playPauseButtonInner,
							pressed && homeStyles.playPauseButtonPressed,
						]}
						accessibilityRole="button"
						accessibilityLabel={play ? 'Pause' : 'Play'}
					>
						{play == true && <Play style={{ color: "#ffffff"}}></Play>}
						{play != true && <Pause style={{ color: "#ffffff"}}></Pause>}
					</Pressable>
				</View>
					
				<View style={homeStyles.playerInfo}>
					<ThemedText style={homeStyles.playerTitle}>{currentTrack.title}</ThemedText>
					<ThemedText style={homeStyles.playerArtist}>{currentTrack.artist}</ThemedText>
				</View>
				
				<View style={[homeStyles.playerCover, { backgroundColor: currentTrack.cover }]} />
			</LiquidGlass>
		</View>
	);
}