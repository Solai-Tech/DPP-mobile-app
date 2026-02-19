import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import GradientBackground from '../../src/components/GradientBackground';
import { useProducts } from '../../src/hooks/useProducts';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import {
  Accent,
  TextPrimary,
  TextMuted,
} from '../../src/theme/colors';

const GreenGlow = 'rgba(0,230,118,0.15)';
const GreenBorder = 'rgba(0,230,118,0.25)';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products, refreshProducts } = useProducts();
  const { profile } = useUserProfile();

  const totalScans = products.length;
  const totalScansDisplay = `${totalScans}`;

  const handleLifeCyclePress = () => {
    router.push('/lifecycle');
  };
  const handleHistoryPress = () => {
    router.push('/(tabs)/scan');
  };
  const handleSolaiPress = () => {
    WebBrowser.openBrowserAsync('https://solai.se/dppx/');
  };

  useFocusEffect(
    useCallback(() => {
      refreshProducts();
    }, [refreshProducts])
  );

  return (
    <GradientBackground>
      <View style={[styles.container, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 84 }]}>

        {/* Top Row */}
        <View style={styles.topRow}>
          <Text style={styles.topLabel}>CirTag</Text>
          <View style={styles.activePill}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>Live Tracking</Text>
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
            <Text style={styles.welcomeSub}>Track your products sustainably</Text>
          </View>
          <View style={styles.avatar}>
            <MaterialIcons name="recycling" size={22} color="#FFFFFF" />
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalScansDisplay}</Text>
            <Text style={styles.statUnit}>Monthly Scans</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{products.length}</Text>
            <Text style={styles.statUnit}>Products</Text>
          </View>
        </View>

        {/* Spacer to push actions down */}
        <View style={styles.spacer} />

        {/* Action Tiles */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionTile}
            onPress={handleHistoryPress}
            activeOpacity={0.85}
          >
            <View style={styles.actionIconCircle}>
              <MaterialIcons name="history" size={20} color={Accent} />
            </View>
            <Text style={styles.actionLabel}>Products History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionTile}
            onPress={handleLifeCyclePress}
            activeOpacity={0.85}
          >
            <View style={styles.actionIconCircle}>
              <MaterialIcons name="recycling" size={20} color={Accent} />
            </View>
            <Text style={styles.actionLabel}>Product Life Cycle</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />

        <TouchableOpacity
          style={styles.solaiCard}
          onPress={handleSolaiPress}
          activeOpacity={0.85}
        >
          <View style={styles.cirtagIcon}>
            <MaterialIcons name="eco" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.solaiTextCol}>
            <Text style={styles.solaiTitle}>CirTag</Text>
            <Text style={styles.solaiSub}>Open Digital Product Passport</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={TextMuted} />
        </TouchableOpacity>
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
    marginBottom: 8,
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
    paddingVertical: 14,
  },
  logoMark: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#1F7A3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  logoTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  logoName: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  logoNameAccent: {
    fontSize: 44,
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
    fontWeight: '600',
    color: Accent,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  // Welcome Card
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 16,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  welcomeSub: {
    fontSize: 11,
    color: TextMuted,
    marginTop: 4,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1F7A3A',
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
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statUnit: {
    fontSize: 10,
    color: TextMuted,
    fontWeight: '600',
    marginTop: 6,
  },
  // Spacer
  spacer: {
    flex: 1,
    minHeight: 16,
  },
  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionTile: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  actionIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,230,118,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 11,
    color: TextMuted,
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  solaiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  cirtagIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2EA7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  solaiTextCol: {
    flex: 1,
  },
  solaiTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  solaiSub: {
    fontSize: 11,
    color: TextMuted,
    marginTop: 2,
  },
});
