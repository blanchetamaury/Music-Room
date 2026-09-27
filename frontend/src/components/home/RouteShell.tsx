import { homeStyles } from '@/src/app/(tabs)/homes.styles';
import { DownMenuBar } from '@/src/components/home/MenuDownBar';
import { SideMenuBar } from '@/src/components/home/MenuSideBar';
import { PlayerCard } from '@/src/components/home/PlayerCard';
import { useAuth } from '@/src/context/AuthContext';
import { OutputTrackDeezer } from '@/src/types/deezer/OutputDeezerTrack';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { ReactNode, useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { TabKey } from './BottomNavigation';

const routes: Record<TabKey, '/(tabs)/home' | '/(tabs)/search' | '/(tabs)/profile'> = {
	home: '/(tabs)/home',
	search: '/(tabs)/search',
	profile: '/(tabs)/profile',
};

interface RouteShellProps {
	activeTab: TabKey;
	children: ReactNode | ((onPlayTrack: (track: OutputTrackDeezer) => void) => ReactNode);
}

export function RouteShell({ activeTab, children }: RouteShellProps) {
	const { token, loading, logout } = useAuth();
	const router = useRouter();
	const [currentTrack, setCurrentTrack] = useState<OutputTrackDeezer | null>(null);
	const [autoPlay, setAutoPlay] = useState(false);

	useEffect(() => {
		if (!loading && !token) router.replace('/');
	}, [loading, token, router]);

	const navigate = (tab: TabKey) => router.replace(routes[tab]);
	const logoutAndRedirect = async () => {
		await logout();
		router.replace('/');
	};
	const onPlayTrack = (track: OutputTrackDeezer) => {
		setCurrentTrack(track);
		setAutoPlay(true);
	};

	if (loading || !token) return null;

	return (
		<View style={homeStyles.homeRoot}>
			<LinearGradient
				colors={['#1b0850', '#0A0A0C']}
				start={{ x: 0, y: 1 }}
				end={{ x: 0, y: 0 }}
				style={homeStyles.backgroundOverlay}
			/>
			<View style={homeStyles.content}>
				<View style={homeStyles.page}>{typeof children === 'function' ? children(onPlayTrack) : children}</View>
				{currentTrack && (
					<PlayerCard
						currentTrack={currentTrack}
						autoPlay={autoPlay}
						onAutoPlayHandled={() => setAutoPlay(false)}
					/>
				)}
				{Platform.OS === 'web' ? (
					<SideMenuBar activeTab={activeTab} onTabPress={navigate} onLogout={logoutAndRedirect} />
				) : (
					<DownMenuBar activeTab={activeTab} onTabPress={navigate} onLogout={logoutAndRedirect} />
				)}
			</View>
		</View>
	);
}
