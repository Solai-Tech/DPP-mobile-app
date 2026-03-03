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

const CreamBg = '#F7F5F0';
const White = '#FFFFFF';
const SageAccent = '#5A8C5A';
const TextDark = '#2C3E2D';
const TextGray = 'rgba(44,62,45,0.65)';
const TextMutedLight = 'rgba(44,62,45,0.4)';
const Border = 'rgba(44,62,45,0.1)';

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
          <MaterialIcons name="arrow-back-ios-new" size={ms(18)} color={White} />
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
    backgroundColor: CreamBg,
  },
  flex: {
    flex: 1,
  },
  header: {
    height: vs(48),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    backgroundColor: SageAccent,
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
    color: White,
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
    backgroundColor: '#F0EDE6',
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
