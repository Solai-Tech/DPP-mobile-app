import React from 'react';
import { Image } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackgroundDark, TabBarBg, TabBarInactive } from '../../src/theme/colors';
import { s, vs, ms } from '../../src/utils/scale';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      sceneContainerStyle={{ backgroundColor: BackgroundDark }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: TabBarBg,
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: TabBarInactive,
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: ms(11),
        },
        tabBarItemStyle: {
          paddingTop: vs(2),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={ms(size + 2)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="qr-code-scanner" size={ms(size + 2)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={ms(size + 2)} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
