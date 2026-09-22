import { homeStyles } from '@/src/app/(tabs)/homes.styles';
import { BottomNavigation, TabKey } from '@/src/components/home/BottomNavigation';
import { PlayerCard } from '@/src/components/home/PlayerCard';
import { HeaderSection } from '@/src/components/home/HeaderSection';
import { SongList } from '@/src/components/home/SongList';
import { UserStrip } from '@/src/components/home/UserStrip';
import FluidBackground, { FluidColors } from '@/src/components/ui/FluideBackground';
import { SeparatorFull } from '@/src/components/ui/separator';
import { useAuth } from '@/src/context/AuthContext';
import { OutputTrackDeezer } from '@/src/types/deezer/OutputDeezerTrack';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SearchScreen } from './search';

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

function ProfileContent() {
	return (
		<View style={homeStyles.pageContent}>
			<Text style={homeStyles.pageTitle}>Profile</Text>
		</View>
	);
}

export default function HomeScreen() {
	const [activeTab, setActiveTab] = React.useState<TabKey>('home');
	const [activeTrack, setActiveTrack] = React.useState(0);
	const [currentTrack, setCurrentTrack] = React.useState<OutputTrackDeezer | null>(null);
	const [autoPlay, setAutoPlay] = React.useState(false);
	const { token, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && !token) {
			router.replace('/(auth)/login');
		}
	}, [loading, token, router]);

	const handleSelectTrack = (index: number) => {
		setActiveTrack(index);
	};

	const handlePlayDeezerTrack = (track: OutputTrackDeezer) => {
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

			<View style={homeStyles.content}>
				<View style={homeStyles.page}>
					{activeTab === 'home' && (
						<HomeContent activeTrack={activeTrack} onSelectTrack={handleSelectTrack} />
					)}

					{activeTab === 'search' && <SearchScreen onPlayTrack={handlePlayDeezerTrack} />}

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
