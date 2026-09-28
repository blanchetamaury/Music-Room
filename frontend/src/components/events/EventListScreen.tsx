import { ThemedText } from '@/src/components/utils/themed-text';
import { useAuth } from '@/src/context/AuthContext';
import { useCreateEventMutation, useEventsQuery } from '@/src/lib/fetcher/tanstack/event';
import { MusicEventSummary } from '@/src/types/event/MusicEvent';
import { CalendarDays, Globe, LockKeyhole, Plus, Users, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { InputForm } from '../utils/InputForm';

export function EventListScreen() {
	const { token } = useAuth();
	const router = useRouter();
	const eventsQuery = useEventsQuery(token);
	const createMutation = useCreateEventMutation();

	const [showCreate, setShowCreate] = useState(false);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [isPublic, setIsPublic] = useState(true);

	const events = eventsQuery.data?.pages.flatMap((page) => page.data) ?? [];
	const canSubmit = name.trim().length >= 3;

	const handleCreate = () => {
		if (!token || !canSubmit || createMutation.isPending) return;

		createMutation.mutate(
			{
				token,
				name: name.trim(),
				description: description.trim() || undefined,
				visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
			},
			{
				onSuccess: () => {
					setShowCreate(false);
					setName('');
					setDescription('');
				},
			}
		);
	};

	const renderItem = ({ item }: { item: MusicEventSummary }) => (
		<Pressable
			style={styles.card}
			onPress={() => router.push(`/event/${item.id}`)}
			accessibilityRole="button"
			accessibilityLabel={`Ouvrir l'événement ${item.name}`}
		>
			<View style={styles.cardIcon}>
				<CalendarDays color="#fff" size={20} />
			</View>

			<View style={styles.cardBody}>
				<ThemedText style={styles.cardTitle} numberOfLines={1}>
					{item.name}
				</ThemedText>
				{item.description ? (
					<ThemedText style={styles.cardDescription} numberOfLines={2}>
						{item.description}
					</ThemedText>
				) : null}
				<View style={styles.cardMeta}>
					<View style={styles.metaItem}>
						{item.visibility === 'PUBLIC' ? (
							<Globe color="#9aa0b5" size={12} />
						) : (
							<LockKeyhole color="#9aa0b5" size={12} />
						)}
						<ThemedText style={styles.metaText}>
							{item.visibility === 'PUBLIC' ? 'Public' : 'Privé'}
						</ThemedText>
					</View>
					<View style={styles.metaItem}>
						<Users color="#9aa0b5" size={12} />
						<ThemedText style={styles.metaText}>
							{item.memberCount} membre{item.memberCount > 1 ? 's' : ''}
						</ThemedText>
					</View>
					{item.owner ? <ThemedText style={styles.metaText}>par {item.owner.username}</ThemedText> : null}
				</View>
			</View>
		</Pressable>
	);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<ThemedText type="title" style={styles.heading}>
					Événements
				</ThemedText>
				<Pressable
					style={[styles.createBtn, !canSubmit && styles.createBtnIdle]}
					onPress={() => setShowCreate(true)}
					accessibilityRole="button"
					accessibilityLabel="Créer un événement"
				>
					<Plus color="#0b0b12" size={18} />
					<ThemedText style={styles.createLabel}>Créer</ThemedText>
				</Pressable>
			</View>

			{eventsQuery.isPending ? (
				<View style={styles.center}>
					<ActivityIndicator color="#fff" />
				</View>
			) : eventsQuery.isError ? (
				<View style={styles.center}>
					<ThemedText style={styles.errorText}>{eventsQuery.error?.message}</ThemedText>
					<Pressable style={styles.retryBtn} onPress={() => eventsQuery.refetch()} accessibilityRole="button">
						<ThemedText style={styles.retryLabel}>Réessayer</ThemedText>
					</Pressable>
				</View>
			) : events.length === 0 ? (
				<View style={styles.center}>
					<ThemedText style={styles.emptyText}>Aucun événement pour le moment.</ThemedText>
					<ThemedText style={styles.emptyHint}>
						Créez une session de vote pour choisir la prochaine musique avec vos amis.
					</ThemedText>
				</View>
			) : (
				<FlatList
					data={events}
					keyExtractor={(item) => item.id}
					renderItem={renderItem}
					contentContainerStyle={styles.list}
					refreshing={eventsQuery.isRefetching}
					onRefresh={() => eventsQuery.refetch()}
					onEndReached={() => {
						if (eventsQuery.hasNextPage && !eventsQuery.isFetchingNextPage) {
							eventsQuery.fetchNextPage();
						}
					}}
					onEndReachedThreshold={0.4}
					ListFooterComponent={
						eventsQuery.isFetchingNextPage ? <ActivityIndicator color="#fff" style={styles.footer} /> : null
					}
				/>
			)}

			<Modal visible={showCreate} transparent animationType="fade" onRequestClose={() => setShowCreate(false)}>
				<Pressable style={styles.backdrop} onPress={() => setShowCreate(false)}>
					<Pressable style={styles.sheet} onPress={() => {}}>
						<View style={styles.sheetHeader}>
							<ThemedText type="defaultSemiBold" style={styles.sheetTitle}>
								Nouvel événement
							</ThemedText>
							<Pressable
								onPress={() => setShowCreate(false)}
								accessibilityRole="button"
								accessibilityLabel="Fermer"
							>
								<X color="#fff" size={20} />
							</Pressable>
						</View>

						<InputForm
							isEmail={false}
							placeholder="Nom de l'événement"
							inputValue={name}
							setInputValue={setName}
							style={styles.input}
						/>

						<InputForm
							isEmail={false}
							placeholder="Description (optionnel)"
							inputValue={description}
							setInputValue={setDescription}
							style={styles.input}
						/>

						<Pressable
							style={[styles.chip, isPublic && styles.chipActive]}
							onPress={() => setIsPublic((value) => !value)}
							accessibilityRole="button"
							accessibilityLabel="Basculer la visibilité de l'événement"
						>
							{isPublic ? <Globe color="#fff" size={16} /> : <LockKeyhole color="#fff" size={16} />}
							<ThemedText style={styles.chipLabel}>{isPublic ? 'Public' : 'Privé'}</ThemedText>
						</Pressable>

						{createMutation.isError ? (
							<ThemedText style={styles.errorText}>{createMutation.error.message}</ThemedText>
						) : null}

						<Pressable
							style={[
								styles.submitBtn,
								(!canSubmit || createMutation.isPending) && styles.submitBtnDisabled,
							]}
							onPress={handleCreate}
							disabled={!canSubmit || createMutation.isPending}
							accessibilityRole="button"
						>
							{createMutation.isPending ? (
								<ActivityIndicator color="#0b0b12" size="small" />
							) : (
								<ThemedText type="defaultSemiBold" style={styles.submitLabel}>
									Créer l&apos;événement
								</ThemedText>
							)}
						</Pressable>
					</Pressable>
				</Pressable>
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
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingTop: 12,
		paddingBottom: 10,
		gap: 12,
	},
	heading: {
		fontSize: 26,
		fontWeight: '700',
	},
	createBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 999,
		backgroundColor: '#ffffff',
	},
	createBtnIdle: {
		opacity: 0.6,
	},
	createLabel: {
		color: '#0b0b12',
		fontWeight: '600',
	},
	footer: {
		paddingVertical: 12,
	},
	list: {
		gap: 10,
		paddingBottom: 140,
	},
	card: {
		flexDirection: 'row',
		gap: 12,
		padding: 12,
		borderRadius: 14,
		backgroundColor: 'rgba(255,255,255,0.06)',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.09)',
	},
	cardIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(90,120,255,0.22)',
	},
	cardBody: {
		flex: 1,
		gap: 4,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: '600',
	},
	cardDescription: {
		fontSize: 13,
		opacity: 0.7,
	},
	cardMeta: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		marginTop: 2,
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
	center: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		padding: 24,
	},
	emptyText: {
		fontSize: 16,
		fontWeight: '600',
	},
	emptyHint: {
		fontSize: 13,
		opacity: 0.65,
		textAlign: 'center',
	},
	errorText: {
		color: '#ff8f8f',
		textAlign: 'center',
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
	backdrop: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.65)',
		justifyContent: 'center',
		padding: 20,
	},
	sheet: {
		gap: 12,
		padding: 18,
		borderRadius: 18,
		backgroundColor: '#12121d',
	},
	sheetHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	sheetTitle: {
		fontSize: 17,
	},
	input: {
		marginTop: 0,
	},
	chip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		alignSelf: 'flex-start',
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 999,
		backgroundColor: 'rgba(255,255,255,0.08)',
	},
	chipActive: {
		backgroundColor: 'rgba(90,120,255,0.28)',
	},
	chipLabel: {
		color: '#fff',
		fontSize: 13,
		fontWeight: '600',
	},
	submitBtn: {
		marginTop: 4,
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: 'center',
		backgroundColor: '#ffffff',
	},
	submitBtnDisabled: {
		opacity: 0.5,
	},
	submitLabel: {
		color: '#0b0b12',
	},
});
