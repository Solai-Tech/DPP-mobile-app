import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { s, vs, ms } from '../src/utils/scale';

const CreamBg = '#F7F5F0';
const White = '#FFFFFF';
const SageAccent = '#5A8C5A';
const TextDark = '#2C3E2D';
const TextMuted = 'rgba(44,62,45,0.4)';
const Border = 'rgba(44,62,45,0.1)';
const SageTint = 'rgba(90,140,90,0.08)';

interface SettingItemProps {
  icon: string;
  label: string;
  onPress: () => void;
}

function SettingItem({ icon, label, onPress }: SettingItemProps) {
  return (
    <TouchableOpacity style={styles.itemRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.itemIcon}>
        <MaterialIcons name={icon as any} size={ms(20)} color={SageAccent} />
      </View>
      <Text style={styles.itemLabel}>{label}</Text>
      <MaterialIcons name="chevron-right" size={ms(20)} color={TextMuted} />
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
          <MaterialIcons name="arrow-back-ios-new" size={ms(18)} color={TextDark} />
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
    gap: vs(8),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: White,
    borderRadius: s(14),
    padding: s(16),
    gap: s(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  itemIcon: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: SageTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemLabel: {
    flex: 1,
    fontSize: ms(15),
    fontWeight: '600',
    color: TextDark,
  },
});
