import { ThemedText } from '@/src/components/utils/themed-text';
import { useAuth } from '@/src/context/AuthContext';
import { useSearchQuery } from '@/src/lib/fetcher/tanstack/deezer';
import { useAddEventTrackMutation, useEventQuery, useVoteEventTrackMutation } from '@/src/lib/fetcher/tanstack/event';
import { OutputTrackDeezer } from '@/src/types/deezer/OutputDeezerTrack';
import { EventTrack } from '@/src/types/event/MusicEvent';
import { useDebouncedValue } from '@/src/hooks/useDebouncedValue';
import { useEventPosition } from '@/src/hooks/useEventPosition';
import { ArrowLeft, Check, Globe, LockKeyhole, Plus, ThumbsUp, Users } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

export function EventDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { token } = useAuth();
	const router = useRouter();

	const eventQuery = useEventQuery(token, id ?? null);
	const addTrackMutation = useAddEventTrackMutation();
	const voteMutation = useVoteEventTrackMutation();
	const eventPosition = useEventPosition();

	const [showSearch, setShowSearch] = useState(false);
	const [query, setQuery] = useState('');
	const debouncedQuery = useDebouncedValue(query, 350);
	const searchQuery = useSearchQuery(debouncedQuery, 20);

	const event = eventQuery.data;
	const results = searchQuery.data ?? [];
	const searching = searchQuery.isFetching;
	const voteError = eventPosition.error ?? (voteMutation.error?.message || null);
	const voting = voteMutation.isPending || eventPosition.loading;

	const handleAddTrack = (track: OutputTrackDeezer) => {
		if (!token || !id) return;

		addTrackMutation.mutate(
			{ token, eventId: id, trackId: track.deezerCUID },
			{ onSuccess: () => setShowSearch(false) }
		);
	};

	const handleVote = async (entry: EventTrack) => {
		if (!token || !id || entry.status === 'REJECTED' || voteMutation.isPending) return;

		const needsPosition = event?.votingPolicy === 'LOCATION_TIME' && !eventPosition.position;
		const position = needsPosition ? await eventPosition.request() : (eventPosition.position ?? undefined);
		if (needsPosition && !position) return;

		voteMutation.mutate({ token, eventId: id, trackId: entry.trackId, voted: entry.votedByMe, position });
	};

	if (eventQuery.isPending) {
		return (
			<View style={styles.center}>
				<ActivityIndicator color="#fff" />
			</View>
		);
	}

	if (eventQuery.isError || !event) {
		return (
			<View style={styles.center}>
				<ThemedText style={styles.errorText}>{eventQuery.error?.message ?? 'Événement introuvable'}</ThemedText>
				<Pressable style={styles.retryBtn} onPress={() => router.back()} accessibilityRole="button">
					<ThemedText style={styles.retryLabel}>Retour</ThemedText>
				</Pressable>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Pressable
					onPress={() => router.back()}
					style={styles.backBtn}
					accessibilityRole="button"
					accessibilityLabel="Retour"
				>
					<ArrowLeft color="#fff" size={20} />
				</Pressable>
				<ThemedText style={styles.heading} numberOfLines={1}>
					{event.name}
				</ThemedText>
				<Pressable
					style={styles.addBtn}
					onPress={() => setShowSearch(true)}
					accessibilityRole="button"
					accessibilityLabel="Proposer un morceau"
				>
					<Plus color="#0b0b12" size={18} />
				</Pressable>
			</View>

			{voteError ? (
				<View style={styles.banner} accessibilityRole="alert">
					<ThemedText style={styles.bannerText}>{voteError}</ThemedText>
				</View>
			) : null}

			<FlatList
				data={event.tracks}
				keyExtractor={(item) => item.trackId}
				contentContainerStyle={styles.list}
				ListHeaderComponent={
					<View style={styles.metaBlock}>
						{event.description ? (
							<ThemedText style={styles.description}>{event.description}</ThemedText>
						) : null}
						<View style={styles.metaRow}>
							<View style={styles.metaItem}>
								{event.visibility === 'PUBLIC' ? (
									<Globe color="#9aa0b5" size={12} />
								) : (
									<LockKeyhole color="#9aa0b5" size={12} />
								)}
								<ThemedText style={styles.metaText}>
									{event.visibility === 'PUBLIC' ? 'Public' : 'Privé'}
								</ThemedText>
							</View>
							<View style={styles.metaItem}>
								<Users color="#9aa0b5" size={12} />
								<ThemedText style={styles.metaText}>
									{event.members.length} membre{event.members.length > 1 ? 's' : ''}
								</ThemedText>
							</View>
							<ThemedText style={styles.metaText}>Vote : {event.votingPolicy}</ThemedText>
						</View>
						{event.tracks.length === 0 ? (
							<ThemedText style={styles.emptyText}>
								Aucun morceau proposé. Utilisez + pour en ajouter un.
							</ThemedText>
						) : null}
					</View>
				}
				renderItem={({ item }) => (
					<View style={styles.trackRow}>
						{item.track?.album?.coverMedium ? (
							<Image source={{ uri: item.track.album.coverMedium }} style={styles.cover} />
						) : (
							<View style={[styles.cover, styles.coverPlaceholder]} />
						)}

						<View style={styles.trackInfo}>
							<ThemedText style={styles.trackTitle} numberOfLines={1}>
								{item.track?.title ?? item.trackId}
							</ThemedText>
							<ThemedText style={styles.trackArtist} numberOfLines={1}>
								{item.track?.artists?.[0]?.name ?? 'Artiste inconnu'}
							</ThemedText>
							<ThemedText style={styles.trackStatus}>{item.status}</ThemedText>
						</View>

						<Pressable
							style={[styles.voteBtn, item.votedByMe && styles.voteBtnActive]}
							onPress={() => handleVote(item)}
							disabled={voting}
							accessibilityRole="button"
							accessibilityState={{ selected: item.votedByMe, disabled: voting }}
							accessibilityLabel={`${item.votedByMe ? 'Retirer mon vote' : 'Voter'} pour ${item.track?.title ?? item.trackId}, ${
								item.voteCount
							} vote(s)`}
						>
							<ThemedText style={[styles.voteCount, item.votedByMe && styles.voteCountActive]}>
								{item.voteCount}
							</ThemedText>
							{item.votedByMe ? <Check color="#0b0b12" size={14} /> : <ThumbsUp color="#fff" size={14} />}
						</Pressable>
					</View>
				)}
			/>

			<Modal visible={showSearch} animationType="slide" onRequestClose={() => setShowSearch(false)}>
				<View style={styles.modalRoot}>
					<View style={styles.modalHeader}>
						<ThemedText type="defaultSemiBold" style={styles.sheetTitle}>
							Proposer un morceau
						</ThemedText>
						<Pressable
							onPress={() => setShowSearch(false)}
							accessibilityRole="button"
							accessibilityLabel="Fermer"
						>
							<ThemedText style={styles.retryLabel}>Fermer</ThemedText>
						</Pressable>
					</View>

					<TextInput
						value={query}
						onChangeText={setQuery}
						placeholder="Rechercher un morceau"
						placeholderTextColor="#7a7f92"
						style={styles.searchInput}
						autoCorrect={false}
					/>

					{addTrackMutation.isError ? (
						<ThemedText style={styles.errorText}>{addTrackMutation.error.message}</ThemedText>
					) : null}

					{searching && !results.length ? <ActivityIndicator color="#fff" /> : null}

					<FlatList
						data={results}
						keyExtractor={(item) => item.deezerCUID}
						contentContainerStyle={styles.list}
						ListEmptyComponent={
							debouncedQuery.trim().length > 0 && !searching ? (
								<ThemedText style={styles.emptyText}>Aucun résultat</ThemedText>
							) : null
						}
						renderItem={({ item }) => (
							<Pressable
								style={styles.trackRow}
								onPress={() => handleAddTrack(item)}
								accessibilityRole="button"
								accessibilityLabel={`Proposer ${item.title}`}
							>
								{item.album?.CoverMedium ? (
									<Image source={{ uri: item.album.CoverMedium }} style={styles.cover} />
								) : (
									<View style={[styles.cover, styles.coverPlaceholder]} />
								)}
								<View style={styles.trackInfo}>
									<ThemedText style={styles.trackTitle} numberOfLines={1}>
										{item.title}
									</ThemedText>
									<ThemedText style={styles.trackArtist} numberOfLines={1}>
										{item.artist[0]?.name}
									</ThemedText>
								</View>
								<Plus color="#fff" size={18} />
							</Pressable>
						)}
					/>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: '100%',
		paddingHorizontal: 16,
	},
	center: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		padding: 24,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		paddingTop: 12,
		paddingBottom: 8,
	},
	backBtn: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.08)',
	},
	heading: {
		flex: 1,
		fontSize: 20,
		fontWeight: '700',
	},
	addBtn: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#ffffff',
	},
	list: {
		gap: 8,
		paddingBottom: 140,
	},
	metaBlock: {
		gap: 8,
		paddingBottom: 10,
	},
	description: {
		fontSize: 14,
		opacity: 0.8,
	},
	metaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 14,
		flexWrap: 'wrap',
	},
	metaItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	metaText: {
		fontSize: 12,
		color: '#9aa0b5',
	},
	emptyText: {
		fontSize: 13,
		opacity: 0.6,
	},
	trackRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		padding: 10,
		borderRadius: 12,
		backgroundColor: 'rgba(255,255,255,0.06)',
	},
	cover: {
		width: 44,
		height: 44,
		borderRadius: 8,
	},
	coverPlaceholder: {
		backgroundColor: 'rgba(255,255,255,0.1)',
	},
	trackInfo: {
		flex: 1,
		gap: 2,
	},
	trackTitle: {
		fontSize: 15,
		fontWeight: '600',
	},
	trackArtist: {
		fontSize: 12,
		color: '#9aa0b5',
	},
	trackStatus: {
		fontSize: 10,
		color: '#6f7488',
		letterSpacing: 0.6,
	},
	voteBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 999,
		backgroundColor: 'rgba(255,255,255,0.1)',
	},
	voteBtnActive: {
		backgroundColor: '#ffffff',
	},
	voteCount: {
		fontSize: 13,
		fontWeight: '700',
		color: '#fff',
	},
	voteCountActive: {
		color: '#0b0b12',
	},
	modalRoot: {
		flex: 1,
		backgroundColor: '#0d0d16',
		paddingHorizontal: 16,
		paddingTop: 20,
	},
	modalHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingBottom: 10,
	},
	sheetTitle: {
		fontSize: 17,
	},
	searchInput: {
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.14)',
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		color: '#fff',
		marginBottom: 10,
	},
	errorText: {
		color: '#ff8f8f',
		textAlign: 'center',
	},
	banner: {
		marginHorizontal: 16,
		marginBottom: 8,
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 10,
		backgroundColor: 'rgba(255, 143, 143, 0.12)',
		borderWidth: 1,
		borderColor: 'rgba(255, 143, 143, 0.35)',
	},
	bannerText: {
		color: '#ff8f8f',
		fontSize: 13,
	},
	retryBtn: {
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 999,
		backgroundColor: 'rgba(255,255,255,0.12)',
	},
	retryLabel: {
		fontWeight: '600',
	},
});
