import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function AuthLayout() {
	
	return (
		<Stack
		screenOptions={{
			headerShown: false,
			presentation: 'transparentModal',
		}}
		>
		<Stack.Screen name="[mode]" />
		</Stack>
	);
}

const styles = StyleSheet.create({
  fullOverlay: {
	...StyleSheet.absoluteFillObject,
	zIndex: 0,
	pointerEvents: 'none',
  },
});