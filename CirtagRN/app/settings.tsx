import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { s, vs, ms } from '../src/utils/scale';

interface SettingItemProps {
  icon: string;
  label: string;
  onPress: () => void;
}

function SettingItem({ icon, label, onPress }: SettingItemProps) {
  return (
    <TouchableOpacity style={styles.itemRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.itemIcon}>
        <MaterialIcons name={icon as any} size={ms(20)} color="#00E676" />
      </View>
      <Text style={styles.itemLabel}>{label}</Text>
      <MaterialIcons name="chevron-right" size={ms(20)} color="rgba(255,255,255,0.4)" />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios-new" size={ms(18)} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingItem icon="security" label="Privacy & Security" onPress={() => router.push('/privacy')} />
        <SettingItem icon="notifications" label="Notifications" onPress={() => router.push('/notifications')} />
        <SettingItem icon="tune" label="Preferences" onPress={() => router.push('/preferences')} />
        <SettingItem
          icon="info-outline"
          label="About"
          onPress={() =>
            router.push(
              `/webview?url=${encodeURIComponent('https://solai.se/dppx/')}&title=${encodeURIComponent('About CirTag')}`
            )
          }
        />
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
    gap: vs(8),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: s(14),
    padding: s(16),
    gap: s(12),
  },
  itemIcon: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: 'rgba(0,230,118,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemLabel: {
    flex: 1,
    fontSize: ms(15),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
