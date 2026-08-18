import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BottomNavigation, TabKey } from './BottomNavigation';
import { HeaderSection } from './HeaderSection';
import { PlayerCard } from './PlayerCard';
import { SongList } from './SongList';
import { UserStrip } from './UserStrip';
import { playlistSongs } from './data';
import { homeStyles } from './home.styles';

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
			<View style={homeStyles.separator} />
			<UserStrip />
			<View style={homeStyles.separator} />
			<SongList activeTrack={activeTrack} onSelect={onSelectTrack} />
		</View>
	);
}

function SearchContent() {
	return (
		<View style={styles.pageContent}>
			<Text style={styles.pageTitle}>Search</Text>
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

export function HomePage() {
	const [activeTab, setActiveTab] = useState<TabKey>('home');
	const [activeTrack, setActiveTrack] = useState(0);
	const currentTrack = playlistSongs[activeTrack] ?? playlistSongs[0];

	return (
		<View style={homeStyles.homeRoot}>
			<LinearGradient
				colors={['#110915', '#171126', '#06131d', '#070d18']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={StyleSheet.absoluteFillObject}
			/>
			<View style={homeStyles.backgroundOverlay} />

			{activeTab === 'home' && (
				<HomeContent currentTrack={currentTrack} activeTrack={activeTrack} onSelectTrack={setActiveTrack} />
			)}
			{activeTab === 'search' && <SearchContent />}
			{activeTab === 'profile' && <ProfileContent />}

			<View style={homeStyles.homeFooter}>
				<PlayerCard currentTrack={currentTrack} />
				<BottomNavigation activeTab={activeTab} onSelect={setActiveTab} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	pageContent: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 20,
	},
	pageTitle: {
		color: '#fff',
		fontSize: 32,
		fontWeight: '700',
	},
});
