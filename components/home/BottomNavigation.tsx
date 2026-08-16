import React from 'react';
import { Pressable, View } from 'react-native';

import LiquidGlass from '@/components/LiquidGlass';

import { homeStyles } from '@/components/home/home.styles';

export type TabKey = 'home' | 'playlist' | 'profile';

export function BottomNavigation({
  activeTab,
  onSelect,
}: {
  activeTab: TabKey;
  onSelect: (tab: TabKey) => void;
}) {
  return (
    <LiquidGlass
      style={homeStyles.navBar}
      contentStyle={homeStyles.navBarContent}
      intensity={45}
      radius={28}
      topLeftRadius={28}
      topRightRadius={28}
      bottomLeftRadius={0}
      bottomRightRadius={0}
    >
      <Pressable
        style={[homeStyles.navButton, activeTab === 'playlist' && homeStyles.navButtonActive]}
        onPress={() => onSelect('playlist')}
      >
        <View style={[homeStyles.navGlyph, { backgroundColor: '#ffb26b' }]} />
      </Pressable>

      <Pressable
        style={[homeStyles.navButton, activeTab === 'home' && homeStyles.navButtonActive]}
        onPress={() => onSelect('home')}
      >
        <View style={[homeStyles.navGlyph, { backgroundColor: '#7ec8e3' }]} />
      </Pressable>

      <Pressable
        style={[homeStyles.navButton, activeTab === 'profile' && homeStyles.navButtonActive]}
        onPress={() => onSelect('profile')}
      >
        <View style={[homeStyles.navGlyph, { backgroundColor: '#9b59b6' }]} />
      </Pressable>
    </LiquidGlass>
  );
}
