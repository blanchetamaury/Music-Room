import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BottomNavigation, TabKey } from '@/src/components/app/BottomNavigation';
import { playlistSongs } from '@/src/components/app/data';
import { homeStyles } from '@/src/components/app/home.styles';
import { HeaderSection } from '@/src/components/app/home/HeaderSection';
import { PlayerCard } from '@/src/components/app/PlayerCard';
import { SearchPage } from '@/src/components/app/search/SearchPage';
import { SongList } from '@/src/components/app/SongList';
import { UserStrip } from '@/src/components/app/UserStrip';
import FluidBackground, {
	FluidColors,
} from '@/src/components/ui/FluideBackground';
import { SeparatorFull } from '@/src/components/ui/separator';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';

function HomeContent({
	currentTrack,
	activeTrack,
	onSelectTrack,
}: {
	currentTrack: any;
	activeTrack: number;
	onSelectTrack: (n: number) => void;
}) {
	return (
		<View style={homeStyles.homeContent}>
			<HeaderSection currentTrack={currentTrack} />
			<SeparatorFull />
			<UserStrip />
			<View style={homeStyles.separator} />
			<SongList
				activeTrack={activeTrack}
				onSelect={onSelectTrack}
			/>
		</View>
	);
}

function SearchContent() {
	return (
		<View style={styles.pageContent}>
			<SearchPage />
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
		colour1: [0.05, 0.10, 0.30, 1],
		colour2: [0.10, 0.40, 1.00, 1],
		colour3: [0.80, 0.20, 0.80, 1],
	},

	search: {
		colour1: [0.05, 0.25, 0.15, 1],
		colour2: [0.05, 0.80, 0.35, 1],
		colour3: [0.20, 0.90, 0.70, 1],
	},

	profile: {
		colour1: [0.30, 0.05, 0.10, 1],
		colour2: [0.80, 0.10, 0.25, 1],
		colour3: [1.00, 0.45, 0.10, 1],
	},
};

export default function HomeScreen() {
	const [activeTab, setActiveTab] =
		useState<TabKey>('home');

	const [activeTrack, setActiveTrack] =
		useState(0);

	const currentTrack =
		playlistSongs[activeTrack] ??
		playlistSongs[0];

	const { token, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && !token) {
			router.replace('/(auth)/login');
		}
	}, [loading, token]);

	if (loading || !token) {
		return null;
	}

	return (
		<View style={homeStyles.homeRoot}>

			<FluidBackground
				colors={tabColors[activeTab]}
			/>

			<View style={homeStyles.backgroundOverlay} />

			<View style={styles.content}>
				{activeTab === 'home' && (
					<HomeContent
						currentTrack={currentTrack}
						activeTrack={activeTrack}
						onSelectTrack={setActiveTrack}
					/>
				)}

				{activeTab === 'search' && (
					<SearchContent />
				)}

				{activeTab === 'profile' && (
					<ProfileContent />
				)}

				<View style={homeStyles.homeFooter}>
					<PlayerCard
						currentTrack={currentTrack}
					/>

					<BottomNavigation
						activeTab={activeTab}
						onSelect={setActiveTab}
					/>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		zIndex: 1,
	},

	pageContent: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 20,
		backgroundColor: '#0000',
	},

	pageTitle: {
		color: '#fff',
		fontSize: 32,
		fontWeight: '700',
	},
});