import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { playlistSongs } from '../data';
import LiquidGlass from '../utils/LiquidGlass';
import { ThemedText } from '../utils/themed-text';
import { styles } from './SongList.styles';

export function SongList({ activeTrack, onSelect }: { activeTrack: number; onSelect: (index: number) => void }) {
	return (
		<View style={styles.songSection}>
			<ThemedText style={styles.sectionTitle}>Music list:</ThemedText>
			<View style={styles.songListShell}>
				<LinearGradient
					colors={['rgba(10, 12, 18, 0.95)', 'rgba(10, 12, 18, 0.4)', 'transparent']}
					locations={[0, 0, 1]}
					style={styles.songListFade}
					pointerEvents="none"
				/>

				<ScrollView
					style={styles.songListScroll}
					contentContainerStyle={styles.songListContent}
					showsVerticalScrollIndicator={false}
					bounces={false}
				>
					{playlistSongs.map((song, index) => (
						<Pressable key={`${song.title}-${index}`} onPress={() => onSelect(index)}>
							<LiquidGlass
								style={[styles.songCard, index === activeTrack && styles.songCardActive]}
								contentStyle={styles.songCardContent}
								intensity={18}
								radius={20}
								topLeftRadius={20}
								topRightRadius={20}
								bottomLeftRadius={20}
								bottomRightRadius={20}
							>
								<View style={[styles.songCover, { backgroundColor: song.cover }]} />

								<View style={styles.songInfo}>
									<ThemedText style={styles.songTitle}>{song.title}</ThemedText>
									<ThemedText style={styles.songArtist}>{song.artist}</ThemedText>
								</View>

								<View style={styles.reorderBtn}>
									<ThemedText style={styles.reorderIcon}>≡</ThemedText>
								</View>
							</LiquidGlass>
						</Pressable>
					))}
				</ScrollView>
			</View>
		</View>
	);
}
