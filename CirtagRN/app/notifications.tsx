import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s, vs, ms } from '../src/utils/scale';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + vs(12) }]}>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.sub}>Manage alerts</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: s(20), backgroundColor: '#0A1A14' },
  title: { color: '#FFFFFF', fontSize: ms(18), fontWeight: '700' },
  sub: { color: 'rgba(255,255,255,0.6)', marginTop: vs(8) },
});
