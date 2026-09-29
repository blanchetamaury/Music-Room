import { ThemedText } from '@/src/components/utils/themed-text';
import { usePlayer } from '@/src/context/PlayerContext';
import { toPlayerTrack } from '@/src/types/player/PlayerTrack';
import { useDevicesQuery, useEventsQuery, useLikesQuery } from '@/src/lib/fetcher/tanstack';
import { useAuth } from '@/src/context/AuthContext';
import { CalendarDays, Heart, Pause, Play, Radio, Smartphone, Wifi, WifiOff } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import LiquidGlass from '../utils/LiquidGlass';
import { styles } from './HomeSections.styles';

const State = ({ label }: { label: string }) => (
	<View style={styles.centered}>
		<ThemedText style={styles.stateText}>{label}</ThemedText>
	</View>
);

const LIKES_PREVIEW = 5;

export function LikesPanel() {
	const { token } = useAuth();
	const likes = useLikesQuery(token);
	const { playQueue, currentTrack, isPlaying, toggle } = usePlayer();
	const list = likes.data ?? [];
	const [expanded, setExpanded] = React.useState(false);

	const visible = expanded ? list : list.slice(0, LIKES_PREVIEW);
	const hidden = list.length - visible.length;

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
					<ThemedText style={styles.title}>Liked</ThemedText>
					<ThemedText style={styles.count}>
						<Heart size={12} color="rgba(255,255,255,0.5)" /> {list.length}
					</ThemedText>
				</View>

				{likes.isLoading ? (
					<State label="Loading…" />
				) : likes.isError ? (
					<State label={likes.error.message || 'Could not load your likes.'} />
				) : list.length === 0 ? (
					<State label="No liked track yet." />
				) : (
					<>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.likeRow}
						>
							{visible.map((like, index) => {
								const played = toPlayerTrack(like);
								if (!played) return null;
								const active = currentTrack?.id === played.id;

								return (
									<Pressable
										key={like.trackId}
										onPress={() => (active ? toggle() : playQueue(list, index))}
										style={({ pressed }) => [
											styles.likeCard,
											active && styles.queueCardActive,
											pressed && { opacity: 0.7 },
										]}
										accessibilityRole="button"
										accessibilityLabel={`Play ${played.title} by ${played.artist}`}
										accessibilityHint={played.previewUrl ? undefined : 'No preview available'}
									>
										<View style={styles.likeCover}>
											{active && isPlaying ? (
												<Pause size={14} color="#fff" fill="#fff" />
											) : (
												<Play
													size={14}
													color="rgba(255,255,255,0.8)"
													fill="rgba(255,255,255,0.8)"
												/>
											)}
										</View>
										<ThemedText style={styles.likeTitle} numberOfLines={1}>
											{played.title}
										</ThemedText>
										<ThemedText style={styles.likeArtist} numberOfLines={1}>
											{played.previewUrl ? played.artist : 'No preview'}
										</ThemedText>
									</Pressable>
								);
							})}
						</ScrollView>

						{hidden > 0 || expanded ? (
							<Pressable
								onPress={() => setExpanded((value) => !value)}
								style={styles.seeMore}
								accessibilityRole="button"
								accessibilityState={{ expanded }}
								accessibilityLabel={
									expanded ? 'Show fewer liked tracks' : `Show ${hidden} more liked tracks`
								}
							>
								<ThemedText style={styles.seeMoreText}>
									{expanded ? 'Show less' : `See all ${list.length} (+${hidden})`}
								</ThemedText>
							</Pressable>
						) : null}
					</>
				)}
			</LiquidGlass>
		</View>
	);
}

export function DevicesPanel() {
	const { token } = useAuth();
	const devices = useDevicesQuery(token);
	const online = (devices.data ?? []).filter((device) => device.lastSeenAt && isRecent(device.lastSeenAt)).length;

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
					<ThemedText style={styles.title}>Devices</ThemedText>
					<Smartphone size={16} color="rgba(255,255,255,0.6)" />
				</View>
				{devices.isLoading ? (
					<State label="Loading…" />
				) : devices.isError ? (
					<State label={devices.error.message || 'Could not load your devices.'} />
				) : !devices.data?.length ? (
					<State label="No device paired yet. Register one from the profile tab." />
				) : (
					<ScrollView showsVerticalScrollIndicator={false}>
						{devices.data.slice(0, 4).map((device) => {
							const active = device.lastSeenAt ? isRecent(device.lastSeenAt) : false;
							return (
								<View key={device.id} style={styles.deviceRow}>
									<View style={styles.deviceIcon}>
										{active ? (
											<Wifi size={15} color="#3ECFFF" />
										) : (
											<WifiOff size={15} color="rgba(255,255,255,0.4)" />
										)}
									</View>
									<View style={styles.trackInfo}>
										<ThemedText style={styles.trackTitle} numberOfLines={1}>
											{device.deviceName}
										</ThemedText>
										<ThemedText style={styles.trackArtist}>
											{device.platform} · {active ? 'online' : 'offline'}
										</ThemedText>
									</View>
								</View>
							);
						})}
						<ThemedText style={styles.miniCardHint}>
							{online} online / {devices.data.length} paired
						</ThemedText>
					</ScrollView>
				)}
			</LiquidGlass>
		</View>
	);
}

export function EventsPanel() {
	const { token } = useAuth();
	const events = useEventsQuery(token);
	const list = (events.data?.pages ?? []).flatMap((page) => page.data);

	return (
		<View style={styles.section}>
			<LiquidGlass
				style={styles.panel}
				contentStyle={[styles.panelContent, { paddingVertical: 10 }]}
				intensity={16}
				radius={16}
				topLeftRadius={16}
				topRightRadius={16}
				bottomLeftRadius={16}
				bottomRightRadius={16}
			>
				<View style={[styles.header, { marginBottom: 4 }]}>
					<ThemedText style={styles.eventTitle}>Next events</ThemedText>
					<CalendarDays size={13} color="rgba(255,255,255,0.55)" />
				</View>

				{events.isLoading ? (
					<State label="Loading…" />
				) : events.isError ? (
					<State label={events.error.message || 'Could not load events.'} />
				) : list.length === 0 ? (
					<State label="No event yet." />
				) : (
					list.slice(0, 2).map((event) => (
						<View key={event.id} style={styles.eventRow}>
							<View style={styles.eventIcon}>
								<Radio size={12} color="rgba(255,255,255,0.7)" />
							</View>
							<View style={styles.trackInfo}>
								<ThemedText style={styles.eventName} numberOfLines={1}>
									{event.name}
								</ThemedText>
								<ThemedText style={styles.eventMeta} numberOfLines={1}>
									{event.memberCount} member{event.memberCount > 1 ? 's' : ''} · {event.votingPolicy}
								</ThemedText>
							</View>
						</View>
					))
				)}
			</LiquidGlass>
		</View>
	);
}

const isRecent = (value: string | Date): boolean => Date.now() - new Date(value).getTime() < 5 * 60 * 1000;
