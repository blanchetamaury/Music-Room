import React from 'react';
import { useRouter } from 'expo-router';

import { SearchPage } from '@/src/components/home/SearchPage';
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