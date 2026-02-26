import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTickets } from '../src/hooks/useTickets';
import { getTicketByProductId, moveGeneralChatToTicket } from '../src/database/ticketDao';
import TicketCard from '../src/components/TicketCard';
import { s, vs, ms } from '../src/utils/scale';

const LightBg = '#F5F7FA';
const GreenAccent = '#1B7A3D';
const TextBlack = '#1A1A1A';
const TextGray = '#6B6B6B';
const TextMutedLight = '#999999';
const TextPrimary = '#E8F5E9';

export default function RaiseTicketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const { tickets, createTicket } = useTickets();
  const createdRef = useRef(false);

  // Only create ticket if one doesn't already exist for this product
  useEffect(() => {
    if (createdRef.current) return;
    createdRef.current = true;

    (async () => {
      if (productId) {
        const existing = await getTicketByProductId(Number(productId));
        if (existing) {
          // Ticket exists — still move any new chat messages into it
          await moveGeneralChatToTicket(existing.id, Number(productId));
          return;
        }
        await createTicket('New Support Request', 'Created from product detail', Number(productId));
      } else {
        await createTicket('New Support Request', 'Created from app');
      }
    })();
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios-new" size={ms(18)} color={TextPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Tickets</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {tickets.length === 0 ? (
          <View style={styles.emptyTickets}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="confirmation-number" size={ms(32)} color={TextMutedLight} />
            </View>
            <Text style={styles.emptyText}>No tickets yet</Text>
            <Text style={styles.emptySubtext}>
              Your support ticket will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.ticketsList}>
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onPress={() => router.push({ pathname: '/ticket-detail', params: { ticketId: String(ticket.id) } })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: LightBg,
  },
  flex: {
    flex: 1,
  },
  header: {
    height: vs(48),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    backgroundColor: '#0A1A14',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    width: s(34),
    height: s(34),
    borderRadius: s(17),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(8),
  },
  headerTitle: {
    flex: 1,
    fontSize: ms(16),
    fontWeight: '700',
    color: TextPrimary,
  },
  content: {
    paddingHorizontal: s(20),
    paddingVertical: vs(12),
  },
  ticketsList: {
    gap: s(10),
  },
  emptyTickets: {
    alignItems: 'center',
    padding: s(40),
  },
  emptyIconCircle: {
    width: s(64),
    height: s(64),
    borderRadius: s(32),
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  emptyText: {
    fontSize: ms(14),
    fontWeight: '600',
    color: TextGray,
  },
  emptySubtext: {
    fontSize: ms(12),
    color: TextMutedLight,
    marginTop: vs(4),
    textAlign: 'center',
  },
});
