import React from 'react';
import { Pressable, View } from 'react-native';

import { homeStyles } from '@/src/components/home/home.styles';
import { HomeIcon, MusicIcon } from 'lucide-react';
import LiquidGlass from '../LiquidGlass';

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
        <MusicIcon style={{color: "#ffff"}}></MusicIcon>
      </Pressable>

      <Pressable
        style={[homeStyles.navButton, activeTab === 'home' && homeStyles.navButtonActive]}
        onPress={() => onSelect('home')}
      >
        <HomeIcon style={{ color: "#ffff" }}></HomeIcon>
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
