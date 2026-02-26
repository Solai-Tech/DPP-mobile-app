import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
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

  const handleHistoryPress = () => {
    router.push('/(tabs)/scan');
  };

  useFocusEffect(
    useCallback(() => {
      refreshProducts();
    }, [refreshProducts])
  );

  return (
    <GradientBackground>
      <View style={[styles.container, { paddingTop: insets.top + vs(10), paddingBottom: vs(16) }]}>

        {/* Top Row */}
        <View style={styles.topRow}>
          <Text style={styles.topLabel}>CirTag</Text>
          <View style={styles.activePill}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>Live Tracking</Text>
          </View>
        </View>

        {/* Upper Section — logo + welcome, flexes to fill */}
        <View style={styles.upperSection}>
          <View style={styles.logoSection}>
            <View style={styles.logoMark}>
              <MaterialIcons name="recycling" size={ms(44)} color="#FFFFFF" />
            </View>
            <View style={styles.logoTextRow}>
              <Text style={styles.logoName}>CIRT</Text>
              <Text style={styles.logoNameAccent}>AG</Text>
            </View>
            <Text style={styles.tagline}>Circular Economy Platform.</Text>
            <Text style={styles.taglineSub}>Measure. Trace. Act.</Text>
          </View>

        </View>

        {/* Bottom Section — stats + history */}
        <View style={styles.bottomSection}>
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

          {/* Products History */}
          <TouchableOpacity
            style={styles.historyCard}
            onPress={handleHistoryPress}
            activeOpacity={0.85}
          >
            <View style={styles.historyIconCircle}>
              <MaterialIcons name="history" size={ms(20)} color={Accent} />
            </View>
            <Text style={styles.historyLabel}>Products History</Text>
            <MaterialIcons name="chevron-right" size={ms(20)} color={TextMuted} />
          </TouchableOpacity>
        </View>
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
    marginTop: vs(6),
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
  // Upper section flexes to push bottom content down
  upperSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: vs(20),
  },
  // Logo — large to fill screen
  logoSection: {
    alignItems: 'center',
    marginBottom: vs(24),
  },
  logoMark: {
    width: s(80),
    height: s(80),
    borderRadius: s(24),
    backgroundColor: '#1F7A3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(20),
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 12,
  },
  logoTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: vs(10),
  },
  logoName: {
    fontSize: ms(58),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  logoNameAccent: {
    fontSize: ms(58),
    fontWeight: '800',
    color: Accent,
    letterSpacing: -2,
  },
  tagline: {
    fontSize: ms(20),
    fontWeight: '600',
    color: TextMuted,
    letterSpacing: 0.5,
  },
  taglineSub: {
    fontSize: ms(16),
    fontWeight: '600',
    color: Accent,
    marginTop: vs(8),
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
    padding: s(18),
  },
  welcomeLeft: {},
  welcomeHi: {
    fontSize: ms(12),
    color: TextMuted,
    marginBottom: vs(3),
  },
  welcomeName: {
    fontSize: ms(17),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  welcomeSub: {
    fontSize: ms(11),
    color: TextMuted,
    marginTop: vs(4),
  },
  avatar: {
    width: s(46),
    height: s(46),
    borderRadius: s(23),
    backgroundColor: '#1F7A3A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  // Bottom section sticks to bottom
  bottomSection: {
    gap: vs(10),
  },
  // Stats — compact
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
  // Products History — compact row card
  historyCard: {
    marginTop: vs(10),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: s(16),
    paddingVertical: vs(18),
    paddingHorizontal: s(18),
    gap: s(14),
  },
  historyIconCircle: {
    width: s(34),
    height: s(34),
    borderRadius: s(17),
    backgroundColor: 'rgba(0,230,118,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyLabel: {
    flex: 1,
    fontSize: ms(15),
    color: TextPrimary,
    fontWeight: '600',
  },
});
