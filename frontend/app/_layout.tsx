import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import '@/i18n';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		InterRegular: require('@/assets/fonts/InterTight-Regular.ttf'),
		InterBold: require('@/assets/fonts/InterTight-Bold.ttf'),
		InterMedium: require('@/assets/fonts/InterTight-Medium.ttf'),
		InterLight: require('@/assets/fonts/InterTight-Light.ttf'),
		InterSemiBold: require('@/assets/fonts/InterTight-SemiBold.ttf'),
		InterExtraBold: require('@/assets/fonts/InterTight-ExtraBold.ttf'),
		InterExtraLight: require('@/assets/fonts/InterTight-ExtraLight.ttf'),
	});

	const theme = useTheme();

	const onLayoutRootView = useCallback(async () => {
		if (fontsLoaded) {
			await SplashScreen.hideAsync();
		}
	}, [fontsLoaded]);

	if (!fontsLoaded) {
		return null;
	}

	return (
		<SafeAreaProvider>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<ThemeProvider>
					<StatusBar
						barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
						backgroundColor={theme.colors.background}
					/>
					<KeyboardAvoidingView
						behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
						style={{ flex: 1 }}
						keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 10}
					>
						<View style={{ flex: 1 }} onLayout={onLayoutRootView}>
							<Stack
								screenOptions={{
									headerShown: false,
									animation: 'fade',
									contentStyle: { backgroundColor: theme.colors.background },
								}}
							/>
						</View>
					</KeyboardAvoidingView>
				</ThemeProvider>
			</GestureHandlerRootView>
		</SafeAreaProvider>
	);
}
