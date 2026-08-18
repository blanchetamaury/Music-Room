import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/src/components/haptic-tab';
import { useColorScheme } from '@/src/hooks/use-color-scheme.web';
import { Colors } from '@/src/constants/theme';
import { SharedTabBackground } from '@/src/components/tabs/SharedTabBackground';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <SharedTabBackground />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen name="home" options={{ tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="search" options={{ tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="explore" options={{ tabBarStyle: { display: 'none' } }} />
      </Tabs>
    </>
  );
}