import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNavigation, TabKey } from '@/src/components/app/BottomNavigation';
import { homeStyles } from '@/src/components/app/home.styles';
import { HeaderSection } from '@/src/components/app/home/HeaderSection';
import { PlayerCard } from '@/src/components/app/PlayerCard';
import { SearchPage } from '@/src/components/app/search/SearchPage';
import { SongList } from '@/src/components/app/SongList';
import { UserStrip } from '@/src/components/app/UserStrip';
import FluidBackground, { FluidColors } from '@/src/components/ui/FluideBackground';
import { SeparatorFull } from '@/src/components/ui/separator';
import { useAuth } from '@/src/context/AuthContext';
import { DeezerTrack } from '@/src/types/deezer/deezer';
import { useRouter } from 'expo-router';
import { OutputTrackDeezer } from '@/src/types/deezer/OutputDeezerTrack';

function HomeContent({ activeTrack, onSelectTrack }: { activeTrack: number; onSelectTrack: (n: number) => void }) {
	return (
		<View style={homeStyles.homeContent}>
			<HeaderSection currentTrack={null} />

			<SeparatorFull />

			<UserStrip />

			<View style={homeStyles.separator} />

			<SongList activeTrack={activeTrack} onSelect={onSelectTrack} />
		</View>
	);
}

function SearchContent({ onPlayTrack }: { onPlayTrack: (track: OutputTrackDeezer) => void }) {
	return (
		<View style={styles.pageContent}>
			<SearchPage onPlayTrack={onPlayTrack} />
		</View>
	);
}

function ProfileContent() {
	return (
		<View style={styles.pageContent}>
			<Text style={styles.pageTitle}>Profile</Text>
		</View>
	);
}

const tabColors: Record<TabKey, FluidColors> = {
	home: {
		colour1: [0.05, 0.1, 0.3, 1],
		colour2: [0.1, 0.4, 1.0, 1],
		colour3: [0.8, 0.2, 0.8, 1],
	},

	search: {
		colour1: [0.05, 0.25, 0.15, 1],
		colour2: [0.05, 0.8, 0.35, 1],
		colour3: [0.2, 0.9, 0.7, 1],
	},

	profile: {
		colour1: [0.3, 0.05, 0.1, 1],
		colour2: [0.8, 0.1, 0.25, 1],
		colour3: [1.0, 0.45, 0.1, 1],
	},
};

const tabs: TabKey[] = ['home', 'search', 'profile'];

export default function HomeScreen() {
	const [activeTab, setActiveTab] = React.useState<TabKey>('home');

	const [activeTrack, setActiveTrack] = React.useState(0);

	const [currentTrack, setCurrentTrack] = React.useState<OutputTrackDeezer | null>(null);

	const [autoPlay, setAutoPlay] = React.useState(false);

	const { token, loading } = useAuth();
	const router = useRouter();

	const insets = useSafeAreaInsets();

	useEffect(() => {
		if (!loading && !token) {
			router.replace('/(auth)/login');
		}
	}, [loading, token, router]);

	const changeTab = (direction: number) => {
		const currentIndex = tabs.indexOf(activeTab);
		const nextIndex = currentIndex + direction;

		if (nextIndex < 0 || nextIndex >= tabs.length) {
			return;
		}

		setActiveTab(tabs[nextIndex]);
	};

	const handleSelectTrack = (index: number) => {
		setActiveTrack(index);
	};

	const handlePlayDeezerTrack = (track: OutputTrackDeezer) => {
		console.log('[Home] Play track:', track.title);

		setCurrentTrack(track);
		setAutoPlay(true);
	};

	if (loading || !token) {
		return null;
	}

	return (
		<View style={homeStyles.homeRoot}>
			<FluidBackground colors={tabColors[activeTab]} />

			<View style={homeStyles.backgroundOverlay} />

			<View style={styles.content}>
				<View style={styles.page}>
					{activeTab === 'home' && (
						<HomeContent activeTrack={activeTrack} onSelectTrack={handleSelectTrack} />
					)}

					{activeTab === 'search' && <SearchContent onPlayTrack={handlePlayDeezerTrack} />}

					{activeTab === 'profile' && <ProfileContent />}
				</View>

				{currentTrack && (
					<PlayerCard
						currentTrack={currentTrack}
						autoPlay={autoPlay}
						onAutoPlayHandled={() => {
							setAutoPlay(false);
						}}
					/>
				)}

				<BottomNavigation activeTab={activeTab} onSelect={setActiveTab} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		zIndex: 1,
	},

	page: {
		flex: 1,
		minHeight: 0,
	},

	pageContent: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 5,
		backgroundColor: '#0000',
	},

	pageTitle: {
		color: '#fff',
		fontSize: 32,
		fontWeight: '700',
	},
});
