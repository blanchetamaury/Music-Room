import { useAuth } from '@/src/context/AuthContext';
import { HomeIcon, SearchIcon, UserIcon } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LiquidGlass from '../utils/LiquidGlass';
import { styles } from './BottomNavigation.styles';

export type TabKey = 'home' | 'search' | 'profile';

export function BottomNavigation({ activeTab, onSelect }: { activeTab: TabKey; onSelect: (tab: TabKey) => void }) {
	const { loading, user } = useAuth();
	const insets = useSafeAreaInsets();

	const tabs: { key: TabKey; icon: React.ReactNode }[] = [
		{ key: 'search', icon: <SearchIcon size={22} color="#fff" /> },
		{ key: 'home', icon: <HomeIcon size={22} color="#fff" /> },
		{
			key: 'profile',
			icon:
				user && !loading ? (
					<Image
						source={{ uri: user.avatarUrl ?? undefined }}
						style={{ width: 22, height: 22, borderRadius: 11 }}
					/>
				) : (
					<UserIcon size={22} color="#fff" />
				),
		},
	];

	return (
		<LiquidGlass
			style={[
				styles.navBar,
				{
					paddingBottom: insets.bottom + 40,
				},
			]}
			contentStyle={styles.navBarContent}
			intensity={90}
			radius={28}
			topLeftRadius={15}
			topRightRadius={15}
			bottomLeftRadius={0}
			bottomRightRadius={0}
		>
			{!loading &&
				tabs.map(({ key, icon }) => (
					<Pressable
						key={key}
						style={[styles.navButton, activeTab === key && styles.navButtonActive]}
						onPress={() => onSelect(key)}
					>
						{icon}

						{activeTab === key && <View style={styles.navIndicator} />}
					</Pressable>
				))}
		</LiquidGlass>
	);
}
