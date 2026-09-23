import { UserCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Platform, Pressable, View } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
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
			<View style={{ width: 40, height: 40 }} />
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
