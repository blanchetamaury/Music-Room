import React from 'react';
import { ScrollView, View } from 'react-native';

import LiquidGlass from '../LiquidGlass';
import { ThemedText } from '../themed-text';

import { playlistUsers } from './data';
import { homeStyles } from './home.styles';

export function UserStrip() {
	return (
		<View style={homeStyles.userSection}>
			<ThemedText style={homeStyles.sectionTitle}>Users list:</ThemedText>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={homeStyles.userListContent}
			>
				{playlistUsers.map((user, index) => (
					<LiquidGlass
						key={`${user.name}-${index}`}
						style={homeStyles.userBubble}
						contentStyle={homeStyles.userBubbleContent}
						intensity={16}
						radius={18}
						topLeftRadius={18}
						topRightRadius={18}
						bottomLeftRadius={18}
						bottomRightRadius={18}
					>
						<View style={[homeStyles.avatar, { backgroundColor: user.color }]} />
						<ThemedText style={homeStyles.userName}>{user.name}</ThemedText>
					</LiquidGlass>
				))}
			</ScrollView>
		</View>
	);
}
