import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import GradientBackground from '../../src/components/GradientBackground';
import CirtagLogo from '../../src/components/CirtagLogo';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import { useProducts } from '../../src/hooks/useProducts';
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
        <MaterialIcons name={icon} size={20} color={Accent} />
      </View>
      <View style={menuStyles.textCol}>
        <Text style={menuStyles.label}>{label}</Text>
        {subtitle ? <Text style={menuStyles.subtitle}>{subtitle}</Text> : null}
      </View>
      <MaterialIcons name="chevron-right" size={20} color={TextMuted} />
    </TouchableOpacity>
  );
}

const menuStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CardDark,
    borderRadius: 14,
    padding: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textCol: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: TextPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: TextSecondary,
    marginTop: 1,
  },
});

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useUserProfile();
  const { products } = useProducts();

  return (
    <GradientBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <CirtagLogo size="small" />
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={{ height: 24 }} />

        {/* Avatar + Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={36} color={Accent} />
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.role}>{profile.role}</Text>
          <Text style={styles.company}>{profile.company}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{products.length}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {products.reduce((sum, p) => {
                  const m = p.co2Total?.match(/([\d.]+)/);
                  return sum + (m ? parseFloat(m[1]) : 0);
                }, 0).toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Kg CO₂</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 20 }} />

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <MenuItem icon="settings" label="Settings" subtitle="App preferences" />
          <MenuItem icon="notifications" label="Notifications" subtitle="Manage alerts" />
          <MenuItem icon="security" label="Privacy & Security" subtitle="Data protection" />
          <MenuItem icon="help-outline" label="Help & FAQ" subtitle="Get answers" />
          <MenuItem icon="info-outline" label="About CirTag" subtitle="Version 1.0.0" />
        </View>

        <View style={{ height: 24 }} />

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} activeOpacity={0.7}>
          <MaterialIcons name="logout" size={18} color="#E53935" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TextPrimary,
  },
  profileCard: {
    backgroundColor: CardDark,
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: TextPrimary,
  },
  role: {
    fontSize: 14,
    color: Accent,
    fontWeight: '500',
    marginTop: 2,
  },
  company: {
    fontSize: 13,
    color: TextSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: TextPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: TextSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  menuSection: {
    paddingHorizontal: 20,
    gap: 8,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(229,57,53,0.1)',
    borderRadius: 14,
    marginHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E53935',
  },
});
