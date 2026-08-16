import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import LiquidGlass from '@/components/LiquidGlass';
import { ThemedText } from '@/components/themed-text';

import { playlistSongs } from './data';
import { homeStyles } from './home.styles.ts';

export function SongList({
  activeTrack,
  onSelect,
}: {
  activeTrack: number;
  onSelect: (index: number) => void;
}) {
  return (
    <View style={homeStyles.songSection}>
      <ThemedText style={homeStyles.sectionTitle}>Music list:</ThemedText>
      <View style={homeStyles.songListShell}>
        <LinearGradient
          colors={['rgba(10, 12, 18, 0.95)', 'rgba(10, 12, 18, 0.4)', 'transparent']}
          locations={[0, 0, 1]}
          style={homeStyles.songListFade}
          pointerEvents="none"
        />

        <ScrollView
          style={homeStyles.songListScroll}
          contentContainerStyle={homeStyles.songListContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {playlistSongs.map((song, index) => (
            <Pressable key={`${song.title}-${index}`} onPress={() => onSelect(index)}>
              <LiquidGlass
                style={[homeStyles.songCard, index === activeTrack && homeStyles.songCardActive]}
                contentStyle={homeStyles.songCardContent}
                intensity={18}
                radius={20}
                topLeftRadius={20}
                topRightRadius={20}
                bottomLeftRadius={20}
                bottomRightRadius={20}
              >
                <View style={[homeStyles.songCover, { backgroundColor: song.cover }]} />

                <View style={homeStyles.songInfo}>
                  <ThemedText style={homeStyles.songTitle}>{song.title}</ThemedText>
                  <ThemedText style={homeStyles.songArtist}>{song.artist}</ThemedText>
                </View>

                <View style={homeStyles.reorderBtn}>
                  <ThemedText style={homeStyles.reorderIcon}>≡</ThemedText>
                </View>
              </LiquidGlass>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
