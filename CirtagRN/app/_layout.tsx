import React, { useEffect } from 'react';
import { View, LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold } from '@expo-google-fonts/outfit';
import { BackgroundDark } from '../src/theme/colors';

LogBox.ignoreAllLogs(true);
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      const timer = setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {});
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: BackgroundDark }}>
      <StatusBar style="dark" backgroundColor={BackgroundDark} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: BackgroundDark } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="product/[id]"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="product-chat"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ticket-detail"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="documents"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="pdf-viewer"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
    </View>
  );
}
