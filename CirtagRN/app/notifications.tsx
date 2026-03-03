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
const SageTint = 'rgba(90,140,90,0.08)';
const Border = 'rgba(44,62,45,0.1)';

interface NotifItemProps {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}

function NotifItem({ icon, title, description, value, onToggle }: NotifItemProps) {
  return (
    <View style={styles.notifRow}>
      <View style={styles.notifIcon}>
        <MaterialIcons name={icon as any} size={ms(22)} color={SageAccent} />
      </View>
      <View style={styles.notifInfo}>
        <Text style={styles.notifTitle}>{title}</Text>
        <Text style={styles.notifDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: 'rgba(44,62,45,0.12)', true: 'rgba(90,140,90,0.35)' }}
        thumbColor={value ? SageAccent : '#BBBBBB'}
      />
    </View>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [scanAlerts, setScanAlerts] = useState(true);
  const [recycleAlerts, setRecycleAlerts] = useState(true);
  const [chatAlerts, setChatAlerts] = useState(true);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios-new" size={ms(18)} color={TextDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <NotifItem
          icon="document-scanner"
          title="Scan Results Alerts"
          description="Receive important updates related to your recent product scans."
          value={scanAlerts}
          onToggle={setScanAlerts}
        />
        <NotifItem
          icon="recycling"
          title="Recycling Instructions"
          description="Get guidance on how to properly recycle or dispose of scanned products."
          value={recycleAlerts}
          onToggle={setRecycleAlerts}
        />
        <NotifItem
          icon="chat"
          title="Chat Assistance Prompts"
          description="Get suggestions to ask relevant questions about your scanned product."
          value={chatAlerts}
          onToggle={setChatAlerts}
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
    gap: vs(16),
  },
  notifRow: {
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
  notifIcon: {
    width: s(44),
    height: s(44),
    borderRadius: s(22),
    backgroundColor: SageTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifInfo: {
    flex: 1,
  },
  notifTitle: {
    fontSize: ms(15),
    fontWeight: '700',
    color: TextDark,
    marginBottom: vs(4),
  },
  notifDesc: {
    fontSize: ms(12),
    color: TextGray,
    lineHeight: ms(17),
  },
});
