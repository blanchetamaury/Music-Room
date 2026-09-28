import React from 'react';
import { ScrollView, View } from 'react-native';
import { playlistUsers } from '../data';
import LiquidGlass from '../utils/LiquidGlass';
import { ThemedText } from '../utils/themed-text';
import { styles } from './UserStrip.styles';

export function UserStrip() {
	return (
		<View style={styles.userSection}>
			<ThemedText style={styles.sectionTitle}>Users list:</ThemedText>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.userListContent}
			>
				{playlistUsers.map((user, index) => (
					<LiquidGlass
						key={`${user.name}-${index}`}
						style={styles.userBubble}
						contentStyle={styles.userBubbleContent}
						intensity={16}
						radius={18}
						topLeftRadius={18}
						topRightRadius={18}
						bottomLeftRadius={18}
						bottomRightRadius={18}
					>
						<View style={[styles.avatar, { backgroundColor: user.color }]} />
						<ThemedText style={styles.userName}>{user.name}</ThemedText>
					</LiquidGlass>
				))}
			</ScrollView>
		</View>
	);
}
