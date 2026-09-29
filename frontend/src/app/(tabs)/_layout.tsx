import { MiniPlayer } from '@/src/components/player/MiniPlayer';
import { SharedTabBackground } from '@/src/components/tabs/SharedTabBackground';
import { HapticTab } from '@/src/components/utils/Haptic-tab';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/use-color-scheme.web';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function TabLayout() {
	const colorScheme = useColorScheme();

	return (
		<View style={{ flex: 1 }}>
			<SharedTabBackground />
			<Tabs
				screenOptions={{
					tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
					headerShown: false,
					tabBarButton: HapticTab,
				}}
			>
				<Tabs.Screen name="home" options={{ tabBarStyle: { display: 'none' } }} />
				<Tabs.Screen name="search" options={{ tabBarStyle: { display: 'none' } }} />
				<Tabs.Screen name="events" options={{ tabBarStyle: { display: 'none' } }} />
				<Tabs.Screen name="profile" options={{ tabBarStyle: { display: 'none' } }} />
			</Tabs>

			<MiniPlayer />
		</View>
	);
}
