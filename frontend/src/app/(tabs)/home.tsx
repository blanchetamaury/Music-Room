import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomNavigation, TabKey } from '@/src/components/home/BottomNavigation';
import { HeaderSection } from '@/src/components/home/HeaderSection';
import { PlayerCard } from '@/src/components/home/PlayerCard';
import { SongList } from '@/src/components/home/SongList';
import { UserStrip } from '@/src/components/home/UserStrip';
import { playlistSongs } from '@/src/components/home/data';
import { homeStyles } from '@/src/components/home/home.styles';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [activeTrack, setActiveTrack] = useState(0);
  const currentTrack = playlistSongs[activeTrack] ?? playlistSongs[0];

  return (
    <View style={homeStyles.homeRoot}>
      <LinearGradient
        colors={['#110915', '#171126', '#06131d', '#070d18']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={homeStyles.backgroundOverlay} />

      <View style={homeStyles.homeContent}>
        <HeaderSection currentTrack={currentTrack} />
        <View style={homeStyles.separator} />
        <UserStrip />
        <View style={homeStyles.separator} />
        <SongList activeTrack={activeTrack} onSelect={setActiveTrack} />
      </View>

      <View style={homeStyles.homeFooter}>
        <PlayerCard currentTrack={currentTrack} />
        <BottomNavigation activeTab={activeTab} onSelect={setActiveTab} />
      </View>
    </View>
  );
}