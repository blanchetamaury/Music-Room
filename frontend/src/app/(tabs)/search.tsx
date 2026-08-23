import { useRouter } from 'expo-router';
import React from 'react';

import { SearchPage } from '@/src/components/app/search/SearchPage';
import { ThemedView } from '@/src/components/themed-view';

export default function SearchScreen() {
	const router = useRouter();

	const handleNavigateHome = (playlistId: number) => {
		router.replace('/(tabs)/home');
	};

	return (
		<ThemedView style={{ flex: 1 }}>
			<SearchPage onNavigateHome={handleNavigateHome} />
		</ThemedView>
	);
}
