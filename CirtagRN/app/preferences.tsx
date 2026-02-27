import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { s, vs, ms } from '../src/utils/scale';

export default function PreferencesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [autoScan, setAutoScan] = useState(true);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios-new" size={ms(18)} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferences</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Dark Mode</Text>
            <Text style={styles.rowDesc}>Use dark theme across the app</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: 'rgba(255,255,255,0.15)', true: 'rgba(0,230,118,0.4)' }}
            thumbColor={darkMode ? '#00E676' : '#888'}
          />
        </View>
        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Auto-Scan on Launch</Text>
            <Text style={styles.rowDesc}>Open scanner automatically when app starts</Text>
          </View>
          <Switch
            value={autoScan}
            onValueChange={setAutoScan}
            trackColor={{ false: 'rgba(255,255,255,0.15)', true: 'rgba(0,230,118,0.4)' }}
            thumbColor={autoScan ? '#00E676' : '#888'}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1A14',
  },
  header: {
    height: vs(48),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    width: s(34),
    height: s(34),
    borderRadius: s(17),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(8),
  },
  headerTitle: {
    fontSize: ms(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    padding: s(20),
    paddingBottom: vs(40),
    gap: vs(12),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: s(14),
    padding: s(16),
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    fontSize: ms(15),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: vs(4),
  },
  rowDesc: {
    fontSize: ms(12),
    color: 'rgba(255,255,255,0.6)',
  },
});
