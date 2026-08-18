import React from 'react';
import { View } from 'react-native';

import LiquidGlass from '../LiquidGlass';
import { ThemedText } from '../themed-text';
import { Track } from './data';
import { homeStyles } from './home.styles';

export function HeaderSection({ currentTrack }: { currentTrack: Track }) {
  return (
    <View style={homeStyles.headerRow}>
      <View style={homeStyles.headerTextWrap}>
        <ThemedText type="title" style={homeStyles.welcomeText}>
          Welcome Ntomé,
        </ThemedText>
        <ThemedText style={homeStyles.subText}>
          You are currently listening to{' '}
          <ThemedText style={homeStyles.subTextStrong}>{currentTrack.title}</ThemedText>
        </ThemedText>
      </View>

      <LiquidGlass
        style={homeStyles.playlistBadge}
        contentStyle={homeStyles.playlistBadgeContent}
        intensity={16}
        radius={18}
        topLeftRadius={18}
        topRightRadius={18}
        bottomLeftRadius={18}
        bottomRightRadius={18}
      >
        <View style={homeStyles.playlistLogo} />
      </LiquidGlass>
    </View>
  );
}
