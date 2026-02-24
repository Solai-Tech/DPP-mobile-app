import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Accent, TextMuted } from '../src/theme/colors';
import { s, vs, ms } from '../src/utils/scale';

export default function LifeCycleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.page, { paddingTop: insets.top + vs(6), paddingBottom: insets.bottom + vs(2) }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios-new" size={ms(18)} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Product Passport</Text>
          <Text style={styles.subtitle}>Scanned just now</Text>
        </View>
        <View style={styles.verifiedPill}>
          <MaterialIcons name="verified" size={ms(14)} color="#2E7D32" />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Product Card */}
        <View style={styles.productCard}>
          <View style={styles.productIcon}>
            <MaterialIcons name="recycling" size={ms(28)} color="#1B7A3D" />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>Eco Packaging</Text>
            <Text style={styles.productName}>Unit Pro</Text>
            <Text style={styles.productMeta}>GreenPack AB · Sweden</Text>
            <View style={styles.dppPill}>
              <Text style={styles.dppText}>DPP-2024-ECO-00412</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statTitle}>Total CO₂</Text>
            <Text style={styles.statValue}>0.4</Text>
            <Text style={styles.statUnit}>Low</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statTitle}>Recyclability</Text>
            <Text style={styles.statValue}>94%</Text>
            <Text style={styles.statUnit}>High</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statTitle}>Batch</Text>
            <Text style={styles.statValue}>#204</Text>
            <Text style={styles.statUnit}>Active</Text>
          </View>
        </View>

        {/* Lifecycle */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Product Lifecycle</Text>
          <View style={styles.lifeRow}>
            <LifeStep label="Raw Mat." icon="spa" />
            <LifeStep label="Mfg." icon="factory" />
            <LifeStep label="Transit" icon="local-shipping" active />
            <LifeStep label="Retail" icon="storefront" />
            <LifeStep label="EOL" icon="recycling" />
          </View>
        </View>

        {/* Emissions */}
        <View style={[styles.sectionCard, styles.emissionCard]}>
          <Text style={styles.sectionTitle}>Emission Breakdown</Text>
          <EmissionRow label="Raw Material" value="0.18t" color="#4CAF50" />
          <EmissionRow label="Manufacturing" value="0.12t" color="#2E7D32" />
          <EmissionRow label="Transport" value="0.10t" color="#1B5E20" />
        </View>

        <View style={styles.spacer} />

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionPrimary]}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/tickets')}
          >
            <MaterialIcons name="support-agent" size={ms(18)} color="#FFFFFF" />
            <Text style={styles.actionTextPrimary}>Get Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/tickets')}
          >
            <MaterialIcons name="campaign" size={ms(18)} color="#1A1A1A" />
            <Text style={styles.actionText}>Raise Ticket</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() => Share.share({ message: 'Check out this Digital Product Passport from CirTag!' })}
          >
            <MaterialIcons name="share" size={ms(18)} color="#1A1A1A" />
            <Text style={styles.actionText}>Share DPP</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function LifeStep({ label, icon, active = false }: { label: string; icon: any; active?: boolean }) {
  return (
    <View style={styles.lifeStep}>
      <View style={[styles.lifeIcon, active && styles.lifeIconActive]}>
        <MaterialIcons name={icon} size={ms(14)} color={active ? '#FFFFFF' : '#1B7A3D'} />
      </View>
      <Text style={[styles.lifeLabel, active && styles.lifeLabelActive]}>{label}</Text>
    </View>
  );
}

function EmissionRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.emissionRow}>
      <View style={styles.emissionTop}>
        <Text style={styles.emissionLabel}>{label}</Text>
        <Text style={styles.emissionValue}>{value}</Text>
      </View>
      <View style={styles.emissionBar}>
        <View style={[styles.emissionFill, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: s(16),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    marginBottom: vs(6),
  },
  backBtn: {
    width: s(34),
    height: s(34),
    borderRadius: s(17),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: ms(16),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: ms(11),
    color: TextMuted,
    marginTop: vs(2),
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(4),
    paddingHorizontal: s(8),
    paddingVertical: vs(4),
    borderRadius: s(12),
    backgroundColor: '#E8F5E9',
  },
  verifiedText: {
    fontSize: ms(11),
    fontWeight: '600',
    color: '#2E7D32',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 0,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DFF7E6',
    borderRadius: s(16),
    padding: s(14),
    borderWidth: 1,
    borderColor: '#C8EFD4',
    marginTop: vs(6),
  },
  productIcon: {
    width: s(52),
    height: s(52),
    borderRadius: s(12),
    backgroundColor: '#CFF1DA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(12),
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: ms(15),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  productMeta: {
    fontSize: ms(11),
    color: '#5E6B66',
    marginTop: vs(2),
  },
  dppPill: {
    alignSelf: 'flex-start',
    marginTop: vs(6),
    backgroundColor: '#C9F0D5',
    paddingHorizontal: s(8),
    paddingVertical: vs(3),
    borderRadius: s(10),
  },
  dppText: {
    fontSize: ms(10),
    fontWeight: '600',
    color: '#2E7D32',
  },
  statsRow: {
    flexDirection: 'row',
    gap: s(10),
    marginTop: vs(22),
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: s(14),
    padding: s(10),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF1F3',
  },
  statTitle: {
    fontSize: ms(10),
    color: '#7A8A85',
  },
  statValue: {
    fontSize: ms(16),
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: vs(2),
  },
  statUnit: {
    fontSize: ms(10),
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: vs(2),
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: s(14),
    padding: s(12),
    borderWidth: 1,
    borderColor: '#EEF1F3',
    marginTop: vs(20),
  },
  emissionCard: {
    marginTop: vs(24),
  },
  spacer: {
    flex: 1,
    minHeight: vs(8),
  },
  sectionTitle: {
    fontSize: ms(13),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: vs(8),
  },
  lifeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lifeStep: {
    alignItems: 'center',
    flex: 1,
  },
  lifeIcon: {
    width: s(26),
    height: s(26),
    borderRadius: s(13),
    backgroundColor: '#E9F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(4),
  },
  lifeIconActive: {
    backgroundColor: '#1B7A3D',
  },
  lifeLabel: {
    fontSize: ms(9),
    color: '#7A8A85',
  },
  lifeLabelActive: {
    color: '#1B7A3D',
    fontWeight: '700',
  },
  emissionRow: {
    marginTop: vs(6),
  },
  emissionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(6),
  },
  emissionLabel: {
    fontSize: ms(11),
    color: '#5E6B66',
  },
  emissionValue: {
    fontSize: ms(11),
    color: '#1A1A1A',
    fontWeight: '600',
  },
  emissionBar: {
    height: vs(6),
    backgroundColor: '#EEF1F3',
    borderRadius: s(6),
    overflow: 'hidden',
  },
  emissionFill: {
    height: vs(6),
    width: '60%',
    borderRadius: s(6),
  },
  actionsRow: {
    flexDirection: 'row',
    gap: s(10),
    marginTop: vs(6),
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: s(14),
    paddingVertical: vs(10),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF1F3',
  },
  actionPrimary: {
    backgroundColor: Accent,
    borderColor: Accent,
  },
  actionTextPrimary: {
    color: '#FFFFFF',
    fontSize: ms(10),
    fontWeight: '700',
    marginTop: vs(4),
  },
  actionText: {
    color: '#1A1A1A',
    fontSize: ms(10),
    fontWeight: '600',
    marginTop: vs(4),
  },
});
