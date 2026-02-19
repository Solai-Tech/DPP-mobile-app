import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { BackgroundDark } from '../src/theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const minSplashMs = 1000;

  useEffect(() => {
    setIsReady(true);
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (isReady) {
      const elapsed = Date.now() - startTimeRef.current;
      const delay = Math.max(0, minSplashMs - elapsed);
      setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {});
      }, delay);
    }
  }, [isReady]);

  return (
    <View
      style={{ flex: 1, backgroundColor: BackgroundDark }}
      onLayout={onLayoutRootView}
    >
      <StatusBar style="light" backgroundColor={BackgroundDark} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="product/[id]"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
    </View>
  );
}
