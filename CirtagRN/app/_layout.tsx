import React, { useEffect } from 'react';
import { View, LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { BackgroundDark } from '../src/theme/colors';

LogBox.ignoreAllLogs(true);
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    // Wait for the full component tree to mount and paint before hiding splash
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: BackgroundDark }}>
      <StatusBar style="light" backgroundColor={BackgroundDark} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: BackgroundDark } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="product/[id]"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ticket-detail"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
    </View>
  );
}
