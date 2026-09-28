import React from 'react';
import { ScrollView, View } from 'react-native';
import { playlistUsers } from '../data';
import LiquidGlass from '../utils/LiquidGlass';
import { ThemedText } from '../utils/themed-text';
import { styles } from './UserStrip.styles';

export function UserStrip() {
	return (
		<View style={{ width: '100%', paddingHorizontal: 10}}>
			<LiquidGlass
				style={styles.userSection}
				intensity={16}
				radius={8}
				topLeftRadius={8}
				topRightRadius={8}
				bottomLeftRadius={8}
				bottomRightRadius={8}
			>
				<ThemedText style={[styles.sectionTitle, { fontSize: 24 }]}>Friends</ThemedText>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.userListContent}
				>
					{playlistUsers.map((user, index) => (
						<View style={styles.userBubble}>
							<View style={[styles.avatar, { backgroundColor: user.color }]} />
							<ThemedText style={styles.userName}>{user.name}</ThemedText>
						</View>
					))}
				</ScrollView>
			</LiquidGlass>
		</View>
	);
}
