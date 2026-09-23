import { useAuth } from '@/src/context/AuthContext';
import { usePlaylistQuery } from '@/src/lib/fetcher/tanstack/user';
import { ChevronLeft, Heart, LockKeyhole, Music2, Users } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, View } from 'react-native';
import { ThemedText } from '../utils/themed-text';
import { styles } from './PlaylistProfile.styles';
import { Like } from '@/src/types/user/like';

interface PlaylistProfileProps {
	setPopup: (value: null) => void;
	id: string;
}

interface PlaylistLikeProfileProps {
	setPopup: (value: null) => void;
	like: Like[] | undefined;
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

export function PlaylistLikeProfile({ setPopup, like }: PlaylistLikeProfileProps) {
	return (
		<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
			<View style={styles.headerRow}>
				<Pressable accessibilityLabel="Close playlist" onPress={() => setPopup(null)} style={styles.iconButton}>
					<ChevronLeft color="#ffffff" size={22} />
				</Pressable>
				<ThemedText style={styles.headerLabel}>Likes playlist</ThemedText>
				<View style={styles.iconButton} />
			</View>

			<View style={styles.hero}>
				<View style={styles.coverContainer}>
					<Heart color="#fff" fill="#fff" style={{ width: '50%', height: '50%' }} />
				</View>
				<View style={styles.details}>
					<ThemedText numberOfLines={2} style={styles.title}>
						Likes
					</ThemedText>
					<ThemedText numberOfLines={3} style={styles.description}>
						list of likes for you.
					</ThemedText>
					<View style={styles.metaRow}>
						<View style={styles.metaItem}>
							<Music2 color="rgba(255,255,255,0.65)" size={15} />
							<ThemedText style={styles.metaText}>{like?.length ?? 0} tracks</ThemedText>
						</View>
						<View style={styles.metaItem}>
							<LockKeyhole color="rgba(255,255,255,0.65)" size={15} />
							<ThemedText style={styles.metaText}>Private</ThemedText>
						</View>
					</View>
				</View>
			</View>

			<View style={styles.sectionHeader}>
				<ThemedText style={styles.sectionTitle}>Tracks</ThemedText>
				<ThemedText style={styles.sectionCount}>{like?.length ?? 0}</ThemedText>
			</View>

			{like == null ? (
				<View style={styles.emptyState}>
					<Music2 color="rgba(255,255,255,0.4)" size={24} />
					<ThemedText style={styles.mutedText}>This playlist is empty.</ThemedText>
				</View>
			) : (
				<View style={styles.trackList}>
					{like &&
						like.map((track, index) => (
							<View key={track.trackId} style={styles.trackRow}>
								<View style={styles.trackNumber}>
									<ThemedText style={styles.numberText}>{index + 1}</ThemedText>
								</View>
								<View style={styles.trackIcon}>
									{track.track.album.cover == null ? (
										<Music2 color="rgba(255,255,255,0.65)" size={17} />
									) : (
										<Image
											source={{ uri: track.track.album.cover }}
											style={styles.trackIcon}
										></Image>
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
