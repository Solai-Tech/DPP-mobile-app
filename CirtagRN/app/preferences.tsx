import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { s, vs, ms } from '../src/utils/scale';

const CreamBg = '#F7F5F0';
const White = '#FFFFFF';
const SageAccent = '#5A8C5A';
const TextDark = '#2C3E2D';
const TextGray = 'rgba(44,62,45,0.65)';
const Border = 'rgba(44,62,45,0.1)';

export default function PreferencesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [autoScan, setAutoScan] = useState(true);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios-new" size={ms(18)} color={TextDark} />
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
            trackColor={{ false: 'rgba(44,62,45,0.12)', true: 'rgba(90,140,90,0.35)' }}
            thumbColor={darkMode ? SageAccent : '#BBBBBB'}
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
            trackColor={{ false: 'rgba(44,62,45,0.12)', true: 'rgba(90,140,90,0.35)' }}
            thumbColor={autoScan ? SageAccent : '#BBBBBB'}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CreamBg,
  },
  header: {
    height: vs(48),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    backgroundColor: White,
    borderBottomWidth: 1,
    borderBottomColor: Border,
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
    color: TextDark,
  },
  content: {
    padding: s(20),
    paddingBottom: vs(40),
    gap: vs(12),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: White,
    borderRadius: s(14),
    padding: s(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    fontSize: ms(15),
    fontWeight: '700',
    color: TextDark,
    marginBottom: vs(4),
  },
  rowDesc: {
    fontSize: ms(12),
    color: TextGray,
  },
});
