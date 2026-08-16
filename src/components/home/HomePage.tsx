import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomNavigation, TabKey } from './BottomNavigation';
import { HeaderSection } from './HeaderSection';
import { PlayerCard } from './PlayerCard';
import { SongList } from './SongList';
import { UserStrip } from './UserStrip';
import { playlistSongs } from './data';
import { homeStyles } from './home.styles';

export function HomePage() {
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
