import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s, vs, ms } from '../src/utils/scale';

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + vs(12) }]}>
      <Text style={styles.title}>Help & FAQ</Text>
      <Text style={styles.sub}>Get answers</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: s(20), backgroundColor: '#F7F5F0' },
  title: { color: '#2C3E2D', fontSize: ms(18), fontWeight: '700' },
  sub: { color: 'rgba(44,62,45,0.65)', marginTop: vs(8) },
});
