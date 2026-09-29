import { PlaylistOutput } from '@/src/types/playlist/PlaylistOutput';
import { ThemedText } from '@/src/components/utils/themed-text';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import LiquidGlass from '../utils/LiquidGlass';
import { styles } from './HomeSections.styles';

interface PlaylistPickerProps {
	playlists: PlaylistOutput[];
	selectedId: string | null;
	onSelect: (playlist: PlaylistOutput) => void;
}

export function PlaylistPicker({ playlists, selectedId, onSelect }: PlaylistPickerProps) {
	return (
		<View style={styles.section}>
			<LiquidGlass
				style={styles.panel}
				contentStyle={styles.panelContent}
				intensity={16}
				radius={16}
				topLeftRadius={16}
				topRightRadius={16}
				bottomLeftRadius={16}
				bottomRightRadius={16}
			>
				<View style={styles.header}>
					<ThemedText style={styles.title}>Playlists</ThemedText>
					<ThemedText style={styles.count}>
						{playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
					</ThemedText>
				</View>

				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
					{playlists.map((playlist) => {
						const active = playlist.id === selectedId;
						return (
							<Pressable
								key={playlist.id}
								onPress={() => onSelect(playlist)}
								style={({ pressed }) => [
									styles.chip,
									active && styles.chipActive,
									pressed && { opacity: 0.7 },
								]}
								accessibilityRole="button"
								accessibilityState={{ selected: active }}
								accessibilityLabel={`Playlist ${playlist.name}, ${playlist.tracks.length} tracks`}
							>
								<ThemedText
									style={[styles.chipText, active && styles.chipTextActive]}
									numberOfLines={1}
								>
									{playlist.name}
								</ThemedText>
							</Pressable>
						);
					})}
				</ScrollView>
			</LiquidGlass>
		</View>
	);
}
