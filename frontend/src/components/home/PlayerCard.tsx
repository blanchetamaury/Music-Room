import React from 'react';
import { View } from 'react-native';

import LiquidGlass from '../LiquidGlass';
import { ThemedText } from '../themed-text';
import { Track } from './data';
import { homeStyles } from './home.styles';

export function PlayerCard({ currentTrack }: { currentTrack: Track }) {
  return (
    <View style={homeStyles.playerWrap}>
      <LiquidGlass
        style={homeStyles.playerCard}
        contentStyle={homeStyles.playerContent}
        intensity={50}
        radius={22}
        topLeftRadius={22}
        topRightRadius={22}
        bottomLeftRadius={22}
        bottomRightRadius={22}
      >
        <View style={homeStyles.playerControls}>
          <View style={homeStyles.playPauseButton}>
            <ThemedText style={homeStyles.playText}>❚❚</ThemedText>
          </View>
        </View>

        <View style={homeStyles.playerInfo}>
          <ThemedText style={homeStyles.playerTitle}>{currentTrack.title}</ThemedText>
          <ThemedText style={homeStyles.playerArtist}>{currentTrack.artist}</ThemedText>
        </View>

        <View style={[homeStyles.playerCover, { backgroundColor: currentTrack.cover }]} />
      </LiquidGlass>
    </View>
  );
}
