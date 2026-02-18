import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Ticket } from '../types/Ticket';
import { CardDark, Accent, AccentDim, TextPrimary, TextSecondary, TextMuted, Warning, Error as ErrorColor } from '../theme/colors';

interface Props {
  ticket: Ticket;
  onPress: () => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open: { bg: AccentDim, text: Accent },
  in_progress: { bg: 'rgba(255,152,0,0.15)', text: Warning },
  resolved: { bg: 'rgba(76,175,80,0.15)', text: '#4CAF50' },
  closed: { bg: 'rgba(255,255,255,0.08)', text: TextMuted },
};

export default function TicketCard({ ticket, onPress }: Props) {
  const statusStyle = STATUS_COLORS[ticket.status] || STATUS_COLORS.open;
  const date = new Date(ticket.createdAt);
  const dateStr = `${date.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()]}`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconCol}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="confirmation-number" size={18} color={Accent} />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {ticket.title}
        </Text>
        <Text style={styles.date}>{dateStr}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
        <Text style={[styles.statusText, { color: statusStyle.text }]}>
          {ticket.status.replace('_', ' ')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CardDark,
    borderRadius: 14,
    padding: 14,
  },
  iconCol: {
    marginRight: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: TextPrimary,
  },
  date: {
    fontSize: 12,
    color: TextSecondary,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
