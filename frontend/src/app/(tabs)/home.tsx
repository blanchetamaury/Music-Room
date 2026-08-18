import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BottomNavigation, TabKey } from '@/src/components/home/BottomNavigation';
import { playlistSongs } from '@/src/components/home/data';
import { HeaderSection } from '@/src/components/home/HeaderSection';
import { homeStyles } from '@/src/components/home/home.styles';
import { PlayerCard } from '@/src/components/home/PlayerCard';
import { SearchPage } from '@/src/components/home/SearchPage';
import { SongList } from '@/src/components/home/SongList';
import { UserStrip } from '@/src/components/home/UserStrip';

function HomeContent({ currentTrack, activeTrack, onSelectTrack }: { currentTrack: any; activeTrack: number; onSelectTrack: (n: number) => void }) {
  return (
    <View style={homeStyles.homeContent}>
      <HeaderSection currentTrack={currentTrack} />
      <View style={homeStyles.separator} />
      <UserStrip />
      <View style={homeStyles.separator} />
      <SongList activeTrack={activeTrack} onSelect={onSelectTrack} />
    </View>
  );
}

function SearchContent() {
  return (
    <View style={styles.pageContent}>
      <SearchPage></SearchPage>
    </View>
  );
}

function ProfileContent() {
  return (
    <View style={styles.pageContent}>
      <Text style={styles.pageTitle}>Profile</Text>
    </View>
  );
}

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [activeTrack, setActiveTrack] = useState(0);
  const currentTrack = playlistSongs[activeTrack] ?? playlistSongs[0];

  return (
    <View style={homeStyles.homeRoot}>
      <View style={homeStyles.backgroundOverlay} />

      {activeTab === 'home' && (
        <HomeContent currentTrack={currentTrack} activeTrack={activeTrack} onSelectTrack={setActiveTrack} />
      )}
      {activeTab === 'search' && <SearchContent />}
      {activeTab === 'profile' && <ProfileContent />}

      <View style={homeStyles.homeFooter}>
        <PlayerCard currentTrack={currentTrack} />
        <BottomNavigation activeTab={activeTab} onSelect={setActiveTab} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  pageTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
});