import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { playlistSongs } from '../data';
import LiquidGlass from '../utils/LiquidGlass';
import { ThemedText } from '../utils/themed-text';
import { styles } from './SongList.styles';

export function SongList({ activeTrack, onSelect }: { activeTrack: number; onSelect: (index: number) => void }) {
	return (
		<View style={[styles.songSection, { paddingHorizontal: 10, paddingBottom: 10 }]}>
			<LiquidGlass
				style={[styles.songSection, { backgroundColor: 'rgba(0, 0, 0, 0.75)' }]}
				intensity={18}
				radius={8}
				topLeftRadius={8}
				topRightRadius={8}
				bottomLeftRadius={8}
				bottomRightRadius={8}
			>
				<ThemedText style={[styles.sectionTitle, {fontSize: 24}]}>Music queue list</ThemedText>
				<View style={styles.songListShell}>

					<ScrollView
						style={styles.songListScroll}
						contentContainerStyle={styles.songListContent}
						showsVerticalScrollIndicator={false}
						bounces={false}
					>
						{playlistSongs.map((song, index) => (
							<Pressable key={`${song.title}-${index}`} onPress={() => onSelect(index)}>
									<View style={[styles.songCard, index === activeTrack && styles.songCardActive]}>
										<View style={[styles.songCover, { backgroundColor: song.cover }]} />

										<View style={styles.songInfo}>
											<ThemedText style={styles.songTitle}>{song.title}</ThemedText>
											<ThemedText style={styles.songArtist}>{song.artist}</ThemedText>
										</View>

										<View style={styles.reorderBtn}>
											<ThemedText style={styles.reorderIcon}>≡</ThemedText>
										</View>
									</View>
							</Pressable>
						))}
					</ScrollView>
				</View>
			</LiquidGlass>
		</View>
	);
}
