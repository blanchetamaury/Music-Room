import React from 'react';
import { Image, Pressable, View } from 'react-native';

import { HomeIcon, SearchIcon, UserIcon } from 'lucide-react';
import LiquidGlass from '../LiquidGlass';
import { homeStyles } from './home.styles';
import { useAuth } from '@/src/context/AuthContext';

export type TabKey = 'home' | 'search' | 'profile';

export function BottomNavigation({ activeTab, onSelect }: { activeTab: TabKey; onSelect: (tab: TabKey) => void }) {
	const { loading, user } = useAuth();

	const tabs: Array<{ key: TabKey; icon: React.ReactNode }> = [
		{ key: 'search', icon: <SearchIcon size={22} color="#fff" /> },
		{ key: 'home', icon: <HomeIcon size={22} color="#fff" /> },
		{ key: 'profile', icon: user && !loading ? <Image 
			source={{ uri: user.avatarUrl ?? undefined }} 
			style={{ width: 22, height: 22, borderRadius: 11 }} 
		/> : <UserIcon size={22} color="#fff"/>},
	];

	return (
		<LiquidGlass
			style={homeStyles.navBar}
			contentStyle={homeStyles.navBarContent}
			intensity={45}
			radius={28}
			topLeftRadius={28}
			topRightRadius={28}
			bottomLeftRadius={0}
			bottomRightRadius={0}
		>
			{!loading && tabs.map(({ key, icon }) => (
				<Pressable
					key={key}
					style={[homeStyles.navButton, activeTab === key && homeStyles.navButtonActive]}
					onPress={() => onSelect(key)}
				>
					{icon}
					{activeTab === key && <View style={homeStyles.navIndicator} />}
				</Pressable>
			))}
		</LiquidGlass>
	);
}
