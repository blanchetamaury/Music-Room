import { homeStyles } from '@/src/app/(tabs)/homes.styles';
import { HeaderSection } from '@/src/components/home/HeaderSection';
import { DevicesPanel, EventsPanel, LikesPanel } from '@/src/components/home/HomeActivityPanels';
import { MembersStrip } from '@/src/components/home/MembersStrip';
import { PlaylistPicker } from '@/src/components/home/PlaylistPicker';
import { QueuePanel } from '@/src/components/home/QueuePanel';
import { useAuth } from '@/src/context/AuthContext';
import { usePlayer } from '@/src/context/PlayerContext';
import { usePlaylistsInfiniteQuery } from '@/src/lib/fetcher/tanstack';
import { PlaylistOutput } from '@/src/types/playlist/PlaylistOutput';
import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

export function HomePageContent() {
	const { token } = useAuth();
	const { currentTrack } = usePlayer();
	const playlists = usePlaylistsInfiniteQuery(token);

	const all = useMemo<PlaylistOutput[]>(
		() => (playlists.data?.pages ?? []).flatMap((page) => page.data),
		[playlists.data]
	);

	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [seenPlaylists, setSeenPlaylists] = useState(all);

	if (all !== seenPlaylists) {
		setSeenPlaylists(all);
		if (selectedId !== null && !all.some((playlist) => playlist.id === selectedId)) setSelectedId(null);
	}

	const selected = useMemo(
		() => all.find((playlist) => playlist.id === selectedId) ?? all[0] ?? null,
		[all, selectedId]
	);

	return (
		<View style={homeStyles.homeContent}>
			<HeaderSection currentTrack={currentTrack} />

			<ScrollView
				style={{ flex: 1, minHeight: 0 }}
				contentContainerStyle={{ paddingBottom: 160, gap: 20 }}
				showsVerticalScrollIndicator={false}
			>
				<PlaylistPicker
					playlists={all}
					selectedId={selected?.id ?? null}
					onSelect={(playlist) => setSelectedId(playlist.id)}
				/>

				<QueuePanel
					playlist={selected}
					isLoading={playlists.isLoading}
					error={playlists.error as Error | null}
					onRetry={() => void playlists.refetch()}
				/>

				<MembersStrip playlist={selected} />

				<View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 10, alignItems: 'stretch' }}>
					<View style={{ flex: 1 }}>
						<LikesPanel />
					</View>
					<View style={{ flex: 1 }}>
						<DevicesPanel />
					</View>
				</View>

				<EventsPanel />
			</ScrollView>
		</View>
	);
}
