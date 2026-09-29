import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';
import { PlayerProvider } from '../context/PlayerContext';
import { useColorScheme } from '../hooks/use-color-scheme.web';
import { initClientContext } from '../lib/clientContext';
import { queryClient } from '../lib/fetcher/tanstack/query-client';

export const unstable_settings = {
	anchor: '(tabs)',
};

export default function RootLayout() {
	const colorScheme = useColorScheme();

	useEffect(() => {
		void initClientContext();
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<SafeAreaProvider>
				<AuthProvider>
					<PlayerProvider>
						<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
							<Stack
								screenOptions={{
									headerShown: false,
									animation: 'slide_from_right',
								}}
							>
								<Stack.Screen name="(auth)" />
								<Stack.Screen name="(tabs)" />
								<Stack.Screen
									name="modal"
									options={{
										presentation: 'modal',
										title: 'Modal',
									}}
								/>
							</Stack>

							<StatusBar style="auto" />
						</ThemeProvider>
					</PlayerProvider>
				</AuthProvider>
			</SafeAreaProvider>
		</QueryClientProvider>
	);
}
