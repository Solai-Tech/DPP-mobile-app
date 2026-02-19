import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import GradientBackground from '../../src/components/GradientBackground';
import { useProducts } from '../../src/hooks/useProducts';
import { useTickets } from '../../src/hooks/useTickets';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import {
  Accent,
  AccentDim,
  TextPrimary,
  TextMuted,
} from '../../src/theme/colors';

const GreenGlow = 'rgba(0,230,118,0.15)';
const GreenBorder = 'rgba(0,230,118,0.25)';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products } = useProducts();
  const { tickets } = useTickets();
  const { profile } = useUserProfile();

  const totalCo2 = products.reduce((sum, p) => {
    const match = p.co2Total?.match(/([\d.]+)/);
    return sum + (match ? parseFloat(match[1]) : 0);
  }, 0);

  const openTickets = tickets.filter(
    (t) => t.status === 'open' || t.status === 'in_progress'
  ).length;

  return (
    <GradientBackground>
      <View style={[styles.container, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 84 }]}>

        {/* Top Row */}
        <View style={styles.topRow}>
          <Text style={styles.topLabel}>CirTag</Text>
          <View style={styles.activePill}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>Platform Active</Text>
          </View>
        </View>

        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoMark}>
            <MaterialIcons name="recycling" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.logoTextRow}>
            <Text style={styles.logoName}>CIRT</Text>
            <Text style={styles.logoNameAccent}>AG</Text>
          </View>
          <Text style={styles.tagline}>Circular Economy Platform.</Text>
          <Text style={styles.taglineSub}>Measure. Trace. Act.</Text>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeLeft}>
            <Text style={styles.welcomeHi}>Welcome to</Text>
            <Text style={styles.welcomeName}>{profile.company}</Text>
          </View>
          <View style={styles.avatar}>
            <MaterialIcons name="eco" size={24} color="#FFFFFF" />
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalCo2.toFixed(1)}</Text>
            <Text style={styles.statUnit}>Kg CO₂</Text>
            <Text style={styles.statLabel}>Monthly CO₂</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{products.length}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{openTickets}</Text>
            <Text style={styles.statLabel}>Open Tickets</Text>
          </View>
        </View>

        {/* Spacer to push actions down */}
        <View style={styles.spacer} />

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionPrimary}
              onPress={() => router.push('/(tabs)/scan')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="qr-code-scanner" size={26} color="#FFFFFF" />
              <Text style={styles.actionPriLabel}>Scan Product</Text>
              <Text style={styles.actionPriSub}>Scan QR or Barcode</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionSecondary}
              onPress={() => router.push('/(tabs)/tickets')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="support-agent" size={26} color="#FFFFFF" />
              <Text style={styles.actionSecLabel}>Get Support</Text>
              <Text style={styles.actionSecSub}>Chat or create ticket</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 10 }} />
          <TouchableOpacity
            style={styles.actionShareRow}
            onPress={() => WebBrowser.openBrowserAsync('https://solai.se/dppx/')}
            activeOpacity={0.8}
          >
            <View style={styles.shareIconCircle}>
              <MaterialIcons name="share" size={22} color={Accent} />
            </View>
            <View style={styles.shareTextCol}>
              <Text style={styles.shareLabel}>Share DPP</Text>
              <Text style={styles.shareSub}>Share Digital Product Passport</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={TextMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Top Row
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  topLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: TextMuted,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GreenGlow,
    borderWidth: 1,
    borderColor: GreenBorder,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Accent,
  },
  activeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Accent,
  },
  // Logo
  logoSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 10,
  },
  logoTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  logoName: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  logoNameAccent: {
    fontSize: 48,
    fontWeight: '800',
    color: Accent,
    letterSpacing: -2,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: TextMuted,
    letterSpacing: 0.5,
  },
  taglineSub: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.3)',
    marginTop: 3,
    letterSpacing: 0.3,
  },
  // Welcome Card
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 18,
    marginTop: 6,
    marginBottom: 14,
  },
  welcomeLeft: {},
  welcomeHi: {
    fontSize: 12,
    color: TextMuted,
    marginBottom: 3,
  },
  welcomeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statUnit: {
    fontSize: 10,
    color: Accent,
    fontWeight: '600',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    color: TextMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  // Spacer
  spacer: {
    flex: 1,
    minHeight: 16,
  },
  // Actions
  actionsSection: {},
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionPrimary: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  actionPriLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  actionPriSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 3,
  },
  actionSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
  },
  actionSecLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  actionSecSub: {
    fontSize: 10,
    color: TextMuted,
    marginTop: 3,
  },
  actionShareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  shareIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareTextCol: {
    flex: 1,
  },
  shareLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shareSub: {
    fontSize: 11,
    color: TextMuted,
    marginTop: 2,
  },
});
