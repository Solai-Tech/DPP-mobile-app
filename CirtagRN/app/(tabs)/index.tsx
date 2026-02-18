import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import GradientBackground from '../../src/components/GradientBackground';
import CirtagLogo from '../../src/components/CirtagLogo';
import WelcomeCard from '../../src/components/WelcomeCard';
import StatCard from '../../src/components/StatCard';
import SavedProductCard from '../../src/components/SavedProductCard';
import { useProducts } from '../../src/hooks/useProducts';
import { useTickets } from '../../src/hooks/useTickets';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import {
  Accent,
  AccentDim,
  CardDark,
  TextPrimary,
  TextSecondary,
  TextMuted,
} from '../../src/theme/colors';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products, deleteProduct } = useProducts();
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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Header - Bigger & Centered */}
        <View style={styles.logoSection}>
          <CirtagLogo size="large" />
          <Text style={styles.tagline}>Circular Economy Platform.</Text>
          <Text style={styles.taglineSub}>Measure. Trace. Act.</Text>
        </View>

        {/* Notification Bell */}
        <View style={styles.notifRow}>
          <TouchableOpacity style={styles.notifBtn}>
            <MaterialIcons name="notifications-none" size={22} color={TextSecondary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 12 }} />

        {/* Welcome Card */}
        <WelcomeCard name={profile.name} company={profile.company} />

        <View style={{ height: 20 }} />

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            icon="eco"
            label="Monthly CO₂"
            value={totalCo2.toFixed(1)}
            unit="Kg CO₂"
          />
          <StatCard
            icon="inventory-2"
            label="Products"
            value={String(products.length)}
          />
          <StatCard
            icon="confirmation-number"
            label="Open Tickets"
            value={String(openTickets)}
          />
        </View>

        <View style={{ height: 24 }} />

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={{ height: 12 }} />
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/scan')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <MaterialIcons name="qr-code-scanner" size={24} color={Accent} />
            </View>
            <Text style={styles.actionLabel}>Scan Product</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/tickets')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <MaterialIcons name="support-agent" size={24} color={Accent} />
            </View>
            <Text style={styles.actionLabel}>Get Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => WebBrowser.openBrowserAsync('https://solai.se/dppx/')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <MaterialIcons name="share" size={24} color={Accent} />
            </View>
            <Text style={styles.actionLabel}>Share DPP</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />

        {/* Recent Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Products</Text>
          {products.length > 3 && (
            <TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ height: 12 }} />

        {products.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="inventory-2" size={32} color={TextMuted} />
            <Text style={styles.emptyText}>No products scanned yet</Text>
            <Text style={styles.emptySubtext}>
              Scan a QR code to get started
            </Text>
          </View>
        ) : (
          <View style={styles.productsList}>
            {products.slice(0, 3).map((product) => (
              <SavedProductCard
                key={product.id}
                product={product}
                onPress={() => router.push(`/product/${product.id}`)}
                onDelete={() => deleteProduct(product.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: TextSecondary,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  taglineSub: {
    fontSize: 12,
    fontWeight: '500',
    color: TextMuted,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  notifRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    marginTop: -40,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CardDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TextPrimary,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: Accent,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: CardDark,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: TextPrimary,
    textAlign: 'center',
  },
  productsList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  emptyCard: {
    backgroundColor: CardDark,
    borderRadius: 16,
    padding: 32,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: TextSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: TextMuted,
    marginTop: 4,
  },
});
