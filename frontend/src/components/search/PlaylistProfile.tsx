import { useAuth } from '@/src/context/AuthContext';
import { usePlaylistQuery } from '@/src/lib/fetcher/tanstack/user';
import { ChevronLeft, LockKeyhole, Music2, Users } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '../utils/themed-text';

interface PlaylistProfileProps {
	setPopup: (value: null) => void;
	id: string;
}

export function PlaylistProfile({ setPopup, id }: PlaylistProfileProps) {
	const { token } = useAuth();
	const { data: playlist, isLoading, isError } = usePlaylistQuery(token, id);

	if (isLoading) {
		return (
			<View style={styles.state}>
				<ActivityIndicator color="#ffffff" />
				<ThemedText style={styles.mutedText}>Loading playlist...</ThemedText>
			</View>
		);
	}

	if (isError || !playlist) {
		return (
			<View style={styles.state}>
				<ThemedText style={styles.errorText}>Unable to load this playlist.</ThemedText>
				<Pressable accessibilityRole="button" onPress={() => setPopup(null)} style={styles.closeButton}>
					<ThemedText style={styles.closeButtonText}>Close</ThemedText>
				</Pressable>
			</View>
		);
	}

	return (
		<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
			<View style={styles.headerRow}>
				<Pressable accessibilityLabel="Close playlist" onPress={() => setPopup(null)} style={styles.iconButton}>
					<ChevronLeft color="#ffffff" size={22} />
				</Pressable>
				<ThemedText style={styles.headerLabel}>{playlist.name}</ThemedText>
				<View style={styles.iconButton} />
			</View>

			<View style={styles.hero}>
				<View style={styles.coverContainer}>
					{playlist.cover ? (
						<Image
							accessibilityLabel={`${playlist.name} cover`}
							source={{ uri: playlist.cover }}
							style={styles.cover}
						/>
					) : (
						<View style={styles.coverPlaceholder}>
							<Music2 color="rgba(255,255,255,0.65)" size={42} />
						</View>
					)}
				</View>
				<View style={styles.details}>
					<ThemedText numberOfLines={2} style={styles.title}>
						{playlist.name}
					</ThemedText>
					<ThemedText numberOfLines={3} style={styles.description}>
						{playlist.description || 'No description yet.'}
					</ThemedText>
					<View style={styles.metaRow}>
						<View style={styles.metaItem}>
							<Music2 color="rgba(255,255,255,0.65)" size={15} />
							<ThemedText style={styles.metaText}>{playlist.music.length} tracks</ThemedText>
						</View>
						<View style={styles.metaItem}>
							{playlist.private ? (
								<LockKeyhole color="rgba(255,255,255,0.65)" size={15} />
							) : (
								<Users color="rgba(255,255,255,0.65)" size={15} />
							)}
							<ThemedText style={styles.metaText}>{playlist.private ? 'Private' : 'Public'}</ThemedText>
						</View>
					</View>
				</View>
			</View>

			<View style={styles.sectionHeader}>
				<ThemedText style={styles.sectionTitle}>Tracks</ThemedText>
				<ThemedText style={styles.sectionCount}>{playlist.music.length}</ThemedText>
			</View>

			{playlist.music.length === 0 ? (
				<View style={styles.emptyState}>
					<Music2 color="rgba(255,255,255,0.4)" size={24} />
					<ThemedText style={styles.mutedText}>This playlist is empty.</ThemedText>
				</View>
			) : (
				<View style={styles.trackList}>
					{playlist.music.map((track, index) => (
						<View key={track.id} style={styles.trackRow}>
							<View style={styles.trackNumber}>
								<ThemedText style={styles.numberText}>{index + 1}</ThemedText>
							</View>
							<View style={styles.trackIcon}>
								{track.track.album.cover == null ? (
									<Music2 color="rgba(255,255,255,0.65)" size={17} />
								) : (
									<Image source={{ uri: track.track.album.cover }} style={styles.trackIcon}></Image>
								)}
							</View>
							<View style={styles.trackInfo}>
								<ThemedText numberOfLines={1} style={styles.trackTitle}>
									{track.track.title}
								</ThemedText>
								<ThemedText style={styles.trackSubtitle}>Position {track.track.rank}</ThemedText>
							</View>
						</View>
					))}
				</View>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	content: {
		padding: 20,
		paddingBottom: 28,
	},
	state: {
		minHeight: 260,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
		padding: 24,
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 20,
	},
	headerLabel: {
		color: 'rgba(255,255,255,0.58)',
		fontSize: 25,
		fontWeight: '700',
		letterSpacing: 1.5,
	},
	iconButton: {
		width: 36,
		height: 36,
		alignItems: 'center',
		justifyContent: 'center',
	},
	hero: {
		flexDirection: 'row',
		gap: 16,
		marginBottom: 26,
	},
	coverContainer: {
		width: 132,
		height: 132,
		borderRadius: 16,
		overflow: 'hidden',
		backgroundColor: '#293052',
	},
	cover: {
		width: '100%',
		height: '100%',
	},
	coverPlaceholder: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	details: {
		flex: 1,
		justifyContent: 'center',
		minWidth: 0,
	},
	title: {
		color: '#ffffff',
		fontSize: 23,
		fontWeight: '700',
		marginBottom: 8,
	},
	description: {
		color: 'rgba(255,255,255,0.65)',
		fontSize: 13,
		lineHeight: 19,
		marginBottom: 14,
	},
	metaRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
	},
	metaItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	metaText: {
		color: 'rgba(255,255,255,0.65)',
		fontSize: 15,
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255,255,255,0.12)',
		paddingBottom: 10,
		marginBottom: 4,
	},
	sectionTitle: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '700',
	},
	sectionCount: {
		color: 'rgba(255,255,255,0.5)',
		fontSize: 12,
	},
	trackList: {
		gap: 2,
	},
	trackRow: {
		minHeight: 58,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255,255,255,0.07)',
	},
	trackNumber: {
		width: 22,
		alignItems: 'center',
	},
	numberText: {
		color: 'rgba(255,255,255,0.4)',
		fontSize: 12,
	},
	trackIcon: {
		width: 32,
		height: 32,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.08)',
	},
	trackInfo: {
		flex: 1,
		minWidth: 0,
	},
	trackTitle: {
		color: '#ffffff',
		fontSize: 13,
		fontWeight: '600',
	},
	trackSubtitle: {
		color: 'rgba(255,255,255,0.45)',
		fontSize: 11,
		marginTop: 3,
	},
	emptyState: {
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		paddingVertical: 42,
	},
	mutedText: {
		color: 'rgba(255,255,255,0.58)',
		fontSize: 13,
	},
	errorText: {
		color: '#ff9b9b',
		fontSize: 13,
	},
	closeButton: {
		paddingHorizontal: 18,
		paddingVertical: 10,
		borderRadius: 10,
		backgroundColor: 'rgba(255,255,255,0.1)',
	},
	closeButtonText: {
		color: '#ffffff',
		fontSize: 13,
		fontWeight: '600',
	},
});
