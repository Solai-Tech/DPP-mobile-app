import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BackgroundDark } from '../src/theme/colors';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor={BackgroundDark} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="product/[id]"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
    </>
  );
}
