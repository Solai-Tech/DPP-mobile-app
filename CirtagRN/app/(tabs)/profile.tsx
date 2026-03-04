import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import GradientBackground from '../../src/components/GradientBackground';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import { useProducts } from '../../src/hooks/useProducts';
import { s, vs, ms } from '../../src/utils/scale';
import {
  Accent,
  AccentDim,
  CardDark,
  TextPrimary,
  TextSecondary,
  TextMuted,
} from '../../src/theme/colors';

interface MenuItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  subtitle?: string;
  onPress?: () => void;
}

function MenuItem({ icon, label, subtitle, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={menuStyles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={menuStyles.iconCircle}>
        <MaterialIcons name={icon} size={ms(20)} color={Accent} />
      </View>
      <View style={menuStyles.textCol}>
        <Text style={menuStyles.label}>{label}</Text>
        {subtitle ? <Text style={menuStyles.subtitle}>{subtitle}</Text> : null}
      </View>
      <MaterialIcons name="chevron-right" size={ms(20)} color={TextMuted} />
    </TouchableOpacity>
  );
}

const menuStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CardDark,
    borderRadius: s(14),
    padding: s(14),
  },
  iconCircle: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },
  textCol: {
    flex: 1,
  },
  label: {
    fontSize: ms(14),
    fontWeight: '600',
    color: TextPrimary,
  },
  subtitle: {
    fontSize: ms(12),
    color: TextSecondary,
    marginTop: vs(1),
  },
});

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useUserProfile();
  const { products } = useProducts();

  return (
    <GradientBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: insets.top + vs(12), paddingBottom: vs(32) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: vs(20) }} />

        {/* Avatar + Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={ms(36)} color={Accent} />
          </View>
          <Text style={styles.role}>Sustainability</Text>
          <Text style={styles.company}>CirTag Industries</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{products.length}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{products.length}</Text>
              <Text style={styles.statLabel}>Scans</Text>
            </View>
          </View>
        </View>

        <View style={{ height: vs(40) }} />

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <MenuItem icon="settings" label="Settings" subtitle="App preferences" onPress={() => router.push('/settings')} />
          <MenuItem icon="notifications" label="Notifications" subtitle="Manage alerts" onPress={() => router.push('/notifications')} />
          <MenuItem icon="security" label="Privacy & Security" subtitle="Privacy & Data Terms" onPress={() => router.push('/privacy')} />
          <MenuItem
            icon="info-outline"
            label="About CirTag"
            subtitle="Version 1.0.0"
            onPress={() =>
              router.push(
                `/webview?url=${encodeURIComponent('https://solai.se/dppx/')}&title=${encodeURIComponent('About CirTag')}`
              )
            }
          />
        </View>

        <View style={{ height: vs(24) }} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(20),
    gap: s(10),
  },
  headerTitle: {
    fontSize: ms(18),
    fontWeight: '700',
    color: TextPrimary,
  },
  profileCard: {
    backgroundColor: CardDark,
    borderRadius: s(20),
    marginHorizontal: s(20),
    padding: s(24),
    alignItems: 'center',
  },
  avatar: {
    width: s(72),
    height: s(72),
    borderRadius: s(36),
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  name: {
    fontSize: ms(20),
    fontWeight: '700',
    color: TextPrimary,
  },
  role: {
    fontSize: ms(14),
    color: Accent,
    fontWeight: '500',
    marginTop: vs(2),
  },
  company: {
    fontSize: ms(13),
    color: TextSecondary,
    marginTop: vs(2),
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: vs(20),
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: s(24),
  },
  statValue: {
    fontSize: ms(20),
    fontWeight: '800',
    color: TextPrimary,
  },
  statLabel: {
    fontSize: ms(12),
    color: TextSecondary,
    marginTop: vs(2),
  },
  statDivider: {
    width: 1,
    height: vs(30),
    backgroundColor: 'rgba(44,62,45,0.12)',
  },
  menuSection: {
    paddingHorizontal: s(20),
    gap: s(8),
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(196,90,90,0.08)',
    borderRadius: s(14),
    marginHorizontal: s(20),
    paddingVertical: vs(14),
    gap: s(8),
  },
  signOutText: {
    fontSize: ms(14),
    fontWeight: '700',
    color: '#C45A5A',
  },
});
