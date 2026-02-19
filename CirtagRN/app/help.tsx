import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.title}>Help & FAQ</Text>
      <Text style={styles.sub}>Get answers</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#0A1A14' },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  sub: { color: 'rgba(255,255,255,0.6)', marginTop: 8 },
});
