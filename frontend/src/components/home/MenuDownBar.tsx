import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Home, Search, User } from 'lucide-react-native';
import { TabKey } from './BottomNavigation';

interface SideMenuBarProps {
	activeTab: TabKey;
	onTabPress: (tab: TabKey) => void;
}

interface TabItem {
	key: TabKey;
	icon: typeof Home;
}

const TABS: TabItem[] = [
	{ key: 'home', icon: Home },
	{ key: 'search', icon: Search },
	{ key: 'profile', icon: User },
];

export function DownMenuBar({ activeTab, onTabPress }: SideMenuBarProps) {
	return (
		<View style={styles.container}>
			{TABS.map((tab) => (
				<TabButton
					key={tab.key}
					tab={tab}
					isActive={activeTab === tab.key}
					onPress={() => onTabPress(tab.key)}
				/>
			))}
		</View>
	);
}

function TabButton({ tab, isActive, onPress }: { tab: TabItem; isActive: boolean; onPress: () => void }) {
	const Icon = tab.icon;

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ scale: withSpring(isActive ? 1.15 : 1) }],
			opacity: withSpring(isActive ? 1 : 0.5),
		};
	}, [isActive]);

	return (
		<Pressable style={styles.tabButton} onPress={onPress} hitSlop={12}>
			<Animated.View style={[styles.iconWrapper, animatedStyle]}>
				<Icon color="#fff" size={24} />
				{isActive && <View style={styles.activeDot} />}
			</Animated.View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '80%',
		position: 'absolute',
		right: '10%',
		bottom: -5,
		transform: [{ translateY: -20 }],
		backgroundColor: 'rgba(20,20,20,0.75)',
		borderRadius: 24,
		paddingVertical: 16,
		paddingHorizontal: 10,
		gap: 24,
		alignItems: 'center',
		justifyContent: 'space-between',
		flexDirection: 'row',
	},
	tabButton: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	iconWrapper: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	activeDot: {
		width: 4,
		height: 4,
		borderRadius: 2,
		backgroundColor: '#fff',
		marginTop: 4,
	},
});
