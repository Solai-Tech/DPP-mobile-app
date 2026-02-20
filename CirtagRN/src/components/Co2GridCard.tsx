import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CardDark, Accent, TextPrimary, TextSecondary } from '../theme/colors';

interface Props {
  label: string;
  value: string;
}

export default function Co2GridCard({ label, value }: Props) {
  const numericValue = value.replace(/[^\d.]/g, '').substring(0, 10);
  const unit = value.replace(/[\d.]+\s*/, '').trim() || 'kg CO\u2082';

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{numericValue}</Text>
      <Text style={styles.unit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: CardDark,
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontSize: 12,
    color: TextSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: TextPrimary,
    marginTop: 8,
  },
  unit: {
    fontSize: 12,
    color: Accent,
  },
});
