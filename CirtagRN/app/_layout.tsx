import React, { useEffect } from 'react';
import { View, LogBox } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold } from '@expo-google-fonts/outfit';
import { BackgroundDark } from '../src/theme/colors';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

if (__DEV__) LogBox.ignoreAllLogs(true);

// Keep splash screen visible while checking auth
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutNav() {
  const { isLoading, isLoggedIn } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
  });

  // Hide splash when ready
  useEffect(() => {
    if (!isLoading && fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading, fontsLoaded]);

  // Handle auth navigation
  useEffect(() => {
    if (isLoading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'forgot-password';

    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/login');
    } else if (isLoggedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isLoading, isLoggedIn, segments, fontsLoaded]);

  if (isLoading || !fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: BackgroundDark }}>
      <StatusBar style="dark" backgroundColor={BackgroundDark} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: BackgroundDark } }}>
        <Stack.Screen name="login" options={{ animation: 'none' }} />
        <Stack.Screen name="register" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="forgot-password" options={{ animation: 'slide_from_right' }} />
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

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
