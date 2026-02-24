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
import { s, vs, ms } from '../../src/utils/scale';

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
      <View style={[styles.container, { paddingTop: insets.top + vs(10), paddingBottom: vs(10) }]}>

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
            <MaterialIcons name="recycling" size={ms(32)} color="#FFFFFF" />
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
            <MaterialIcons name="recycling" size={ms(22)} color="#FFFFFF" />
          </View>
        </View>

        {/* Stats Row — compact */}
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

        {/* Gap */}
        <View style={styles.sectionGap} />

        {/* Action Tiles */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionTile}
            onPress={handleHistoryPress}
            activeOpacity={0.85}
          >
            <View style={styles.actionIconCircle}>
              <MaterialIcons name="history" size={ms(20)} color={Accent} />
            </View>
            <Text style={styles.actionLabel}>Products History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionTile}
            onPress={handleLifeCyclePress}
            activeOpacity={0.85}
          >
            <View style={styles.actionIconCircle}>
              <MaterialIcons name="recycling" size={ms(20)} color={Accent} />
            </View>
            <Text style={styles.actionLabel}>Product Life Cycle</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.solaiCard}
          onPress={handleSolaiPress}
          activeOpacity={0.85}
        >
          <View style={styles.cirtagIcon}>
            <MaterialIcons name="eco" size={ms(20)} color="#FFFFFF" />
          </View>
          <View style={styles.solaiTextCol}>
            <Text style={styles.solaiTitle}>CirTag</Text>
            <Text style={styles.solaiSub}>Open Digital Product Passport</Text>
          </View>
          <MaterialIcons name="chevron-right" size={ms(20)} color={TextMuted} />
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: s(20),
  },
  // Top Row
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(4),
    marginBottom: vs(8),
  },
  topLabel: {
    fontSize: ms(14),
    fontWeight: '700',
    color: TextMuted,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    backgroundColor: GreenGlow,
    borderWidth: 1,
    borderColor: GreenBorder,
    borderRadius: s(20),
    paddingHorizontal: s(12),
    paddingVertical: vs(5),
  },
  activeDot: {
    width: s(7),
    height: s(7),
    borderRadius: s(4),
    backgroundColor: Accent,
  },
  activeText: {
    fontSize: ms(11),
    fontWeight: '600',
    color: Accent,
  },
  // Logo
  logoSection: {
    alignItems: 'center',
    paddingTop: vs(44),
    paddingBottom: vs(14),
  },
  logoMark: {
    width: s(60),
    height: s(60),
    borderRadius: s(16),
    backgroundColor: '#1F7A3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(14),
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  logoTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: vs(6),
  },
  logoName: {
    fontSize: ms(44),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  logoNameAccent: {
    fontSize: ms(44),
    fontWeight: '800',
    color: Accent,
    letterSpacing: -2,
  },
  tagline: {
    fontSize: ms(14),
    fontWeight: '600',
    color: TextMuted,
    letterSpacing: 0.5,
  },
  taglineSub: {
    fontSize: ms(12),
    fontWeight: '600',
    color: Accent,
    marginTop: vs(4),
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
    borderRadius: s(18),
    padding: s(16),
    marginTop: vs(6),
    marginBottom: vs(14),
  },
  welcomeLeft: {},
  welcomeHi: {
    fontSize: ms(12),
    color: TextMuted,
    marginBottom: vs(3),
  },
  welcomeName: {
    fontSize: ms(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  welcomeSub: {
    fontSize: ms(11),
    color: TextMuted,
    marginTop: vs(4),
  },
  avatar: {
    width: s(42),
    height: s(42),
    borderRadius: s(21),
    backgroundColor: '#1F7A3A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  // Stats — compact, same height as action tiles
  statsRow: {
    flexDirection: 'row',
    gap: s(10),
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: s(16),
    paddingVertical: vs(14),
    paddingHorizontal: s(10),
    alignItems: 'center',
  },
  statValue: {
    fontSize: ms(22),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statUnit: {
    fontSize: ms(10),
    color: TextMuted,
    fontWeight: '600',
    marginTop: vs(6),
  },
  // Fixed gap between stats and actions
  sectionGap: {
    height: vs(10),
  },
  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: s(10),
  },
  actionTile: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: s(18),
    paddingVertical: vs(12),
    paddingHorizontal: s(10),
    alignItems: 'center',
  },
  actionIconCircle: {
    width: s(34),
    height: s(34),
    borderRadius: s(17),
    backgroundColor: 'rgba(0,230,118,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: ms(11),
    color: TextMuted,
    marginTop: vs(10),
    textAlign: 'center',
    fontWeight: '600',
  },
  solaiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: s(16),
    padding: s(14),
    gap: s(12),
    marginTop: vs(14),
  },
  cirtagIcon: {
    width: s(40),
    height: s(40),
    borderRadius: s(12),
    backgroundColor: '#2EA7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  solaiTextCol: {
    flex: 1,
  },
  solaiTitle: {
    fontSize: ms(13),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  solaiSub: {
    fontSize: ms(11),
    color: TextMuted,
    marginTop: vs(2),
  },
});
