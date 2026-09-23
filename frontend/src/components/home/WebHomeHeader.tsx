import { Menu, UserCircle, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Platform, Pressable, View } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { ThemedText } from '../utils/themed-text';
import { TabKey } from './BottomNavigation';
import { styles } from './WebHomeHeader.styles';
import { SearchBar } from '../search/SearchBar';

interface WebHomeHeaderProps {
	activeTab: TabKey;
	onSelect: (tab: TabKey) => void;
	setQuery: (value: string) => void;
	query?: string;
}

export function WebHomeHeader({ activeTab, onSelect, setQuery, query }: WebHomeHeaderProps) {
	const [menuOpen, setMenuOpen] = useState(false);
	const { user } = useAuth();

	if (Platform.OS !== 'web') return null;

	const selectTab = (tab: TabKey) => {
		onSelect(tab);
		setMenuOpen(false);
	};

	return (
		<View style={styles.header}>
			<View style={styles.leftArea}>
				<Pressable
					accessibilityLabel={menuOpen ? 'Close menu' : 'Open menu'}
					style={styles.iconButton}
					onPress={() => setMenuOpen((open) => !open)}
				>
					{menuOpen ? <X size={22} color="#fff" /> : <Menu size={22} color="#fff" />}
				</Pressable>
				{menuOpen && (
					<View style={styles.menu}>
						{(['home', 'search', 'profile'] as TabKey[]).map((tab) => (
							<Pressable key={tab} style={styles.menuItem} onPress={() => selectTab(tab)}>
								<ThemedText style={[styles.menuText, activeTab === tab && styles.menuTextActive]}>
									{tab[0].toUpperCase() + tab.slice(1)}
								</ThemedText>
							</Pressable>
						))}
					</View>
				)}
			</View>
			<SearchBar setQuery={setQuery} query={query} />
			<Pressable
				accessibilityLabel="Open profile"
				style={styles.profileButton}
				onPress={() => selectTab('profile')}
			>
				{user?.avatarUrl ? (
					<Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
				) : (
					<UserCircle size={28} color="#fff" />
				)}
			</Pressable>
		</View>
	);
}
