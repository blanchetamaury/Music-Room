import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
	useAnimatedStyle,
	withTiming,
	useSharedValue,
	interpolate,
	Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Search, User, Menu, X } from 'lucide-react-native';

export type TabKey = 'home' | 'search' | 'profile';

interface SideMenuBarProps {
	activeTab: TabKey;
	onTabPress: (tab: TabKey) => void;
}

interface TabItem {
	key: TabKey;
	icon: typeof Home;
	label: string;
}

const TABS: TabItem[] = [
	{ key: 'home', icon: Home, label: 'Accueil' },
	{ key: 'search', icon: Search, label: 'Recherche' },
	{ key: 'profile', icon: User, label: 'Profil' },
];

const PANEL_WIDTH = 240;
const ITEM_HEIGHT = 52;

export function SideMenuBar({ activeTab, onTabPress }: SideMenuBarProps) {
	const [isOpen, setIsOpen] = useState(false);
	const progress = useSharedValue(0);
	const insets = useSafeAreaInsets();

	const toggleMenu = () => {
		const next = !isOpen;
		setIsOpen(next);
		progress.value = withTiming(next ? 1 : 0, { duration: 280 });
	};

	const closeMenu = () => {
		setIsOpen(false);
		progress.value = withTiming(0, { duration: 280 });
	};

	const handleTabPress = (tab: TabKey) => {
		onTabPress(tab);
		closeMenu();
	};

	const toggleIconStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${progress.value * 90}deg` }],
	}));

	const panelStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateX: interpolate(progress.value, [0, 1], [-PANEL_WIDTH, 0], Extrapolation.CLAMP),
			},
		],
	}));

	const toggleStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateX: interpolate(progress.value, [0, 1], [0, PANEL_WIDTH - 8], Extrapolation.CLAMP),
			},
		],
	}));

	const overlayStyle = useAnimatedStyle(() => ({
		opacity: progress.value * 0.5,
	}));

	return (
		<>
			<Animated.View
				style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]}
				pointerEvents={isOpen ? 'auto' : 'none'}
			>
				<Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
			</Animated.View>

			<Animated.View
				style={[styles.panel, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }, panelStyle]}
				pointerEvents={isOpen ? 'auto' : 'none'}
			>
				<View style={styles.list}>
					{TABS.map((tab, index) => (
						<TabItemAnimated
							key={tab.key}
							tab={tab}
							index={index}
							progress={progress}
							isActive={activeTab === tab.key}
							onPress={() => handleTabPress(tab.key)}
						/>
					))}
				</View>
			</Animated.View>

			<Animated.View style={[styles.toggleWrapper, { top: insets.top + 16 }, toggleStyle]}>
				<Pressable style={styles.toggleButton} onPress={toggleMenu}>
					<Animated.View style={toggleIconStyle}>
						{isOpen ? <X color="#fff" size={22} /> : <Menu color="#fff" size={22} />}
					</Animated.View>
				</Pressable>
			</Animated.View>
		</>
	);
}

function TabItemAnimated({
	tab,
	index,
	progress,
	isActive,
	onPress,
}: {
	tab: TabItem;
	index: number;
	progress: Animated.SharedValue<number>;
	isActive: boolean;
	onPress: () => void;
}) {
	const Icon = tab.icon;

	const animatedStyle = useAnimatedStyle(() => {
		const delay = index * 0.12;
		const local = Math.max(0, Math.min(1, (progress.value - delay) / (1 - delay)));

		return {
			opacity: local,
			transform: [{ translateX: (1 - local) * -20 }],
		};
	});

	return (
		<Animated.View style={[styles.itemWrapper, animatedStyle]}>
			<Pressable style={[styles.item, isActive && styles.itemActive]} onPress={onPress}>
				<Icon color={isActive ? '#fff' : '#bbb'} size={20} />
				<Animated.Text style={[styles.itemLabel, isActive && styles.itemLabelActive]}>
					{tab.label}
				</Animated.Text>
			</Pressable>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	overlay: {
		backgroundColor: '#000',
		zIndex: 99,
	},
	panel: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
		width: PANEL_WIDTH,
		backgroundColor: '#000',
		zIndex: 100,
		borderRightWidth: StyleSheet.hairlineWidth,
		borderRightColor: '#222',
	},
	list: {
		flex: 1,
		paddingHorizontal: 10,
		gap: 4,
	},
	itemWrapper: {
		width: '100%',
		height: ITEM_HEIGHT,
	},
	item: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		paddingHorizontal: 14,
		borderRadius: 10,
		backgroundColor: 'transparent',
	},
	itemActive: {
		backgroundColor: 'rgba(60,60,255,0.25)',
	},
	itemLabel: {
		color: '#bbb',
		fontSize: 15,
		fontWeight: '500',
	},
	itemLabelActive: {
		color: '#fff',
		fontWeight: '600',
	},
	toggleWrapper: {
		position: 'absolute',
		left: 16,
		zIndex: 101,
	},
	toggleButton: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: '#000',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
