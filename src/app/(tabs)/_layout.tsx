import { Tabs } from 'expo-router';
import React from 'react';

import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { HapticTab } from '@/src/components/haptic-tab';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarStyle: { display: 'none'}
        }}
      />
    </Tabs>
  );
}
