import React, { useState } from 'react';
import { GestureResponderEvent, Platform, Pressable, StyleProp, TextStyle } from 'react-native';

import { ThemedText } from '../themed-text';

interface HoverTextProps {
	children: React.ReactNode;
	style?: StyleProp<TextStyle>;
	onPress?: (event: GestureResponderEvent) => void;
}

export function HoverText({ children, style, onPress }: HoverTextProps) {
	const [hovered, setHovered] = useState(false);

	return (
		<Pressable
			style={{
				alignSelf: 'flex-start',
			}}
			onPress={onPress}
			onHoverIn={Platform.OS === 'web' ? () => setHovered(true) : undefined}
			onHoverOut={Platform.OS === 'web' ? () => setHovered(false) : undefined}
		>
			<ThemedText
				style={[
					style,
					hovered && {
						textDecorationLine: 'underline',
					},
				]}
			>
				{children}
			</ThemedText>
		</Pressable>
	);
}
