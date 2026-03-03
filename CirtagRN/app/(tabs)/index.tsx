import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import GradientBackground from '../../src/components/GradientBackground';
import { useProducts } from '../../src/hooks/useProducts';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import {
  Accent,
  TextPrimary,
  TextMuted,
  AccentDim,
  Border,
} from '../../src/theme/colors';
import { s, vs, ms } from '../../src/utils/scale';

const SageGlow = 'rgba(90,140,90,0.10)';
const SageBorder = 'rgba(90,140,90,0.20)';

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
            <View style={styles.logoGlow}>
              <Image
                source={require('../../assets/cirtag_logo.png')}
                style={styles.logoMark}
                contentFit="contain"
              />
            </View>
            <View style={styles.logoTextRow}>
              <Text style={styles.logoName}>CIR</Text>
              <Text style={styles.logoNameAccent}>TAG</Text>
            </View>
            <Text style={styles.taglineSub}>Digital Product Passport Platform</Text>
          </View>
        </View>

        {/* Bottom Section */}
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

          {/* DPP Portal */}
          <TouchableOpacity
            style={styles.dppCard}
            onPress={() => router.push(`/webview?url=${encodeURIComponent('https://solai.se/dppx/')}&title=${encodeURIComponent('DPP Portal')}`)}
            activeOpacity={0.85}
          >
            <View style={styles.dppIconCircle}>
              <MaterialIcons name="language" size={ms(20)} color="#2E7D8B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dppLabel}>DPP Portal</Text>
            </View>
            <MaterialIcons name="open-in-new" size={ms(16)} color={TextMuted} />
          </TouchableOpacity>

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
    backgroundColor: SageGlow,
    borderWidth: 1,
    borderColor: SageBorder,
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
    justifyContent: 'center',
  },
  // Logo — large to fill screen
  logoSection: {
    alignItems: 'center',
    marginBottom: vs(0),
  },
  logoGlow: {
    shadowColor: 'rgba(90,140,90,0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: vs(16),
  },
  logoMark: {
    width: s(110),
    height: s(110),
  },
  logoTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: vs(4),
  },
  logoName: {
    fontSize: ms(58),
    fontWeight: '800',
    color: TextPrimary,
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
    color: Accent,
    letterSpacing: 0.5,
  },
  taglineSub: {
    fontSize: ms(13),
    fontWeight: '500',
    color: TextMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  // Welcome Card
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Border,
    borderRadius: s(18),
    padding: s(18),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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
    color: TextPrimary,
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
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Bottom section sticks to bottom
  bottomSection: {
    gap: vs(6),
    paddingBottom: vs(0),
  },
  // Stats — compact
  statsRow: {
    flexDirection: 'row',
    gap: s(10),
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Border,
    borderRadius: s(16),
    paddingVertical: vs(14),
    paddingHorizontal: s(10),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: ms(22),
    fontWeight: '800',
    color: TextPrimary,
  },
  statUnit: {
    fontSize: ms(10),
    color: TextMuted,
    fontWeight: '600',
    marginTop: vs(6),
  },
  // DPP Portal card
  dppCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Border,
    borderRadius: s(16),
    paddingVertical: vs(14),
    paddingHorizontal: s(18),
    gap: s(14),
    marginTop: vs(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  dppIconCircle: {
    width: s(34),
    height: s(34),
    borderRadius: s(17),
    backgroundColor: 'rgba(46,125,139,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(46,125,139,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dppLabel: {
    fontSize: ms(14),
    color: TextPrimary,
    fontWeight: '600',
  },
  dppUrl: {
    fontSize: ms(11),
    color: TextMuted,
    marginTop: vs(1),
  },
  // Products History — compact row card
  historyCard: {
    marginTop: vs(4),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Border,
    borderRadius: s(16),
    paddingVertical: vs(18),
    paddingHorizontal: s(18),
    gap: s(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  historyIconCircle: {
    width: s(34),
    height: s(34),
    borderRadius: s(17),
    backgroundColor: AccentDim,
    borderWidth: 1,
    borderColor: SageBorder,
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
