import React from 'react';
import { Image } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackgroundDark, TabBarBg, TabBarInactive, TabBarActive, Border } from '../../src/theme/colors';
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
          borderTopWidth: 1,
          borderTopColor: Border,
          height: 52 + insets.bottom,
          paddingTop: 0,
          paddingBottom: Math.max(insets.bottom, 4),
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: TabBarActive,
        tabBarInactiveTintColor: TabBarActive,
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: ms(11),
        },
        tabBarItemStyle: {
          paddingTop: 0,
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
        name="circuit"
        options={{
          title: 'Circuit',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="developer-board" size={ms(size + 2)} color={color} />
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
