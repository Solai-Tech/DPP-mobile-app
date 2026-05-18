import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useSubscription } from '../src/hooks/useSubscription';
import { FREE_LIMIT, PRICING, SubscriptionPlan } from '../src/utils/subscription';
import { s, vs, ms } from '../src/utils/scale';

const CreamBg = '#F7F5F0';
const White = '#FFFFFF';
const Sage = '#5A8C5A';
const SageTint = 'rgba(90,140,90,0.10)';
const SageTintStrong = 'rgba(90,140,90,0.16)';
const TextDark = '#2C3E2D';
const TextGray = 'rgba(44,62,45,0.65)';
const TextMuted = 'rgba(44,62,45,0.4)';
const Border = 'rgba(44,62,45,0.10)';

const FEATURES = [
  'Unlimited DPP (QR / barcode) scans',
  'Unlimited Value scanner analyses',
  'Full PCF carbon breakdown & history',
  'Priority support',
];

// 12 × 99 = 1188 → yearly 999 saves ~16% (≈ 2 months free)
const YEARLY_SAVING_PCT = Math.round(
  (1 - PRICING.yearly.amount / (PRICING.monthly.amount * 12)) * 100
);
const YEARLY_PER_MONTH = Math.round(PRICING.yearly.amount / 12);

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const { subscribed, plan, subscribe, restore } = useSubscription();
  const [selected, setSelected] = useState<SubscriptionPlan>('yearly');

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const handleSubscribe = () => {
    subscribe(selected);
    Alert.alert(
      'Subscription active',
      `You're now on the ${selected === 'yearly' ? 'Yearly' : 'Monthly'} plan. Both scanners are unlimited.`,
      [{ text: 'Great', onPress: close }]
    );
  };

  const handleRestore = () => {
    const ok = restore();
    Alert.alert(
      ok ? 'Subscription restored' : 'Nothing to restore',
      ok
        ? 'Your subscription is active.'
        : 'No previous subscription was found for this account.'
    );
  };

  const subtitle =
    source === 'dpp'
      ? `You've used all ${FREE_LIMIT} free DPP scans.`
      : source === 'value'
      ? `You've used all ${FREE_LIMIT} free Value scans.`
      : `Your first ${FREE_LIMIT} scans on each scanner are free.`;

  // --- Already subscribed state ---
  if (subscribed) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={close} hitSlop={hit}>
          <MaterialIcons name="close" size={ms(24)} color={TextGray} />
        </TouchableOpacity>
        <View style={styles.activeWrap}>
          <View style={[styles.iconCircle, { backgroundColor: SageTintStrong }]}>
            <MaterialIcons name="verified" size={ms(44)} color={Sage} />
          </View>
          <Text style={styles.title}>You're Premium</Text>
          <Text style={styles.subtitle}>
            {plan === 'yearly' ? 'Yearly' : 'Monthly'} plan · both scanners unlimited
          </Text>
          <View style={styles.featureCard}>
            {FEATURES.map((f) => (
              <View key={f} style={styles.featureRow}>
                <MaterialIcons name="check-circle" size={ms(18)} color={Sage} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.cta} onPress={close} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Done</Text>
          </TouchableOpacity>
          <Text style={styles.footNote}>
            Manage or cancel anytime from your store account.
          </Text>
        </View>
      </View>
    );
  }

  // --- Paywall ---
  const PlanCard = ({
    id,
    label,
    price,
    sub,
    badge,
  }: {
    id: SubscriptionPlan;
    label: string;
    price: string;
    sub?: string;
    badge?: string;
  }) => {
    const active = selected === id;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setSelected(id)}
        style={[styles.planCard, active && styles.planCardActive]}
      >
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
        <View style={styles.radioOuter}>
          {active ? <View style={styles.radioInner} /> : null}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.planLabel}>{label}</Text>
          {sub ? <Text style={styles.planSub}>{sub}</Text> : null}
        </View>
        <Text style={styles.planPrice}>{price}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity style={styles.closeBtn} onPress={close} hitSlop={hit}>
        <MaterialIcons name="close" size={ms(24)} color={TextGray} />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + vs(28) }}
      >
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="workspace-premium" size={ms(40)} color={Sage} />
          </View>
          <Text style={styles.title}>Unlock Unlimited Scans</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.featureCard}>
          {FEATURES.map((f) => (
            <View key={f} style={styles.featureRow}>
              <MaterialIcons name="check-circle" size={ms(18)} color={Sage} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          <PlanCard
            id="yearly"
            label="Yearly"
            price={`${PRICING.yearly.amount} ${PRICING.yearly.currency}`}
            sub={`≈ ${YEARLY_PER_MONTH} kr/mo · billed yearly`}
            badge={`BEST VALUE · SAVE ${YEARLY_SAVING_PCT}%`}
          />
          <PlanCard
            id="monthly"
            label="Monthly"
            price={`${PRICING.monthly.amount} ${PRICING.monthly.currency}`}
            sub="billed every month"
          />
        </View>

        <TouchableOpacity style={styles.cta} onPress={handleSubscribe} activeOpacity={0.85}>
          <Text style={styles.ctaText}>
            Subscribe —{' '}
            {selected === 'yearly'
              ? `${PRICING.yearly.amount} ${PRICING.yearly.currency}/year`
              : `${PRICING.monthly.amount} ${PRICING.monthly.currency}/month`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn} hitSlop={hit}>
          <Text style={styles.restoreText}>Restore purchases</Text>
        </TouchableOpacity>

        <Text style={styles.footNote}>
          Recurring billing. Cancel anytime in your store account. By
          subscribing you agree to the Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </View>
  );
}

const hit = { top: s(10), bottom: s(10), left: s(10), right: s(10) };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CreamBg },
  closeBtn: {
    position: 'absolute',
    right: s(16),
    zIndex: 10,
    padding: s(8),
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: s(24),
    marginTop: vs(28),
    marginBottom: vs(20),
  },
  iconCircle: {
    width: s(76),
    height: s(76),
    borderRadius: s(38),
    backgroundColor: SageTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(16),
  },
  title: {
    fontSize: ms(25),
    fontWeight: '800',
    color: TextDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: ms(14),
    color: TextGray,
    textAlign: 'center',
    marginTop: vs(6),
    lineHeight: ms(20),
  },
  featureCard: {
    backgroundColor: White,
    borderRadius: s(18),
    marginHorizontal: s(20),
    padding: s(20),
    gap: vs(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
  },
  featureText: {
    fontSize: ms(14),
    color: TextDark,
    fontWeight: '500',
    flex: 1,
  },
  plans: {
    marginHorizontal: s(20),
    marginTop: vs(20),
    gap: vs(12),
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: White,
    borderRadius: s(16),
    paddingVertical: vs(16),
    paddingHorizontal: s(16),
    borderWidth: 2,
    borderColor: Border,
    gap: s(14),
  },
  planCardActive: {
    borderColor: Sage,
    backgroundColor: SageTint,
  },
  badge: {
    position: 'absolute',
    top: -vs(10),
    left: s(16),
    backgroundColor: Sage,
    borderRadius: s(8),
    paddingHorizontal: s(10),
    paddingVertical: vs(3),
  },
  badgeText: {
    fontSize: ms(10),
    fontWeight: '800',
    color: White,
    letterSpacing: 0.4,
  },
  radioOuter: {
    width: s(22),
    height: s(22),
    borderRadius: s(11),
    borderWidth: 2,
    borderColor: Sage,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: s(12),
    height: s(12),
    borderRadius: s(6),
    backgroundColor: Sage,
  },
  planLabel: {
    fontSize: ms(16),
    fontWeight: '700',
    color: TextDark,
  },
  planSub: {
    fontSize: ms(12),
    color: TextGray,
    marginTop: vs(2),
  },
  planPrice: {
    fontSize: ms(17),
    fontWeight: '800',
    color: TextDark,
  },
  cta: {
    backgroundColor: Sage,
    borderRadius: s(14),
    marginHorizontal: s(20),
    marginTop: vs(22),
    paddingVertical: vs(16),
    alignItems: 'center',
    shadowColor: Sage,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  ctaText: {
    color: White,
    fontSize: ms(15),
    fontWeight: '800',
  },
  restoreBtn: {
    alignSelf: 'center',
    marginTop: vs(16),
    padding: s(6),
  },
  restoreText: {
    fontSize: ms(13),
    fontWeight: '600',
    color: Sage,
  },
  footNote: {
    fontSize: ms(11),
    color: TextMuted,
    textAlign: 'center',
    marginHorizontal: s(28),
    marginTop: vs(16),
    lineHeight: ms(16),
  },
  activeWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: s(24),
    paddingTop: vs(40),
  },
});
