import { Home, LogOut, Search, User } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { TabKey } from './BottomNavigation';

interface SideMenuBarProps {
	activeTab: TabKey;
	onTabPress: (tab: TabKey) => void;
	onLogout: () => Promise<void>;
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

export function DownMenuBar({ activeTab, onTabPress, onLogout }: SideMenuBarProps) {
	return (
		<View style={styles.wrapper}>
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
			<Pressable style={styles.logoutButton} onPress={onLogout} accessibilityLabel="Se déconnecter">
				<LogOut color="#ff9b9b" size={18} />
			</Pressable>
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
	wrapper: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', zIndex: 30 },
	logoutButton: {
		position: 'absolute',
		right: 16,
		bottom: 24,
		width: 38,
		height: 38,
		borderRadius: 19,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(120,20,30,0.65)',
		borderWidth: 1,
		borderColor: 'rgba(255,100,100,0.45)',
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
