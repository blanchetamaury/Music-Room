import { homeStyles } from '@/src/app/(tabs)/homes.styles';
import { DownMenuBar } from '@/src/components/home/MenuDownBar';
import { SideMenuBar } from '@/src/components/home/MenuSideBar';
import { useAuth } from '@/src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { ReactNode, useEffect } from 'react';
import { Platform, View } from 'react-native';
import { TabKey } from './BottomNavigation';

const routes: Record<TabKey, '/(tabs)/home' | '/(tabs)/search' | '/(tabs)/events' | '/(tabs)/profile'> = {
	home: '/(tabs)/home',
	search: '/(tabs)/search',
	events: '/(tabs)/events',
	profile: '/(tabs)/profile',
};

interface RouteShellProps {
	activeTab: TabKey;
	children: ReactNode;
}

export function RouteShell({ activeTab, children }: RouteShellProps) {
	const { token, loading, logout } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && !token) router.replace('/');
	}, [loading, token, router]);

	const navigate = (tab: TabKey) => router.replace(routes[tab]);
	const logoutAndRedirect = async () => {
		await logout();
		router.replace('/');
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
				<View style={homeStyles.page}>{children}</View>
				{Platform.OS === 'web' ? (
					<SideMenuBar activeTab={activeTab} onTabPress={navigate} onLogout={logoutAndRedirect} />
				) : (
					<DownMenuBar activeTab={activeTab} onTabPress={navigate} onLogout={logoutAndRedirect} />
				)}
			</View>
		</View>
	);
}
