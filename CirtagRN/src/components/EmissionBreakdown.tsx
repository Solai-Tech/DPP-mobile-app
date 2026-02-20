import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import EmissionBar from './EmissionBar';
import { CardDark, Accent, AccentDim, TextPrimary, TextSecondary } from '../theme/colors';

interface Props {
  co2Details: string; // "Raw Material:3.15 Kg CO₂,Shipping & Transport:3.18 Kg CO₂"
}

const BAR_COLORS = ['#00E676', '#00C853', '#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9'];

export default function EmissionBreakdown({ co2Details }: Props) {
  if (!co2Details) return null;

  const items = co2Details.split(',').map((item) => {
    const [label, raw] = item.split(':');
    const numMatch = raw?.match(/([\d.]+)/);
    return {
      label: label?.trim() || '',
      value: numMatch ? parseFloat(numMatch[1]) : 0,
    };
  });

  const maxVal = Math.max(...items.map((i) => i.value), 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="bar-chart" size={16} color={Accent} />
        </View>
        <Text style={styles.title}>Emission Breakdown</Text>
      </View>
      <View style={styles.bars}>
        {items.map((item, index) => (
          <EmissionBar
            key={item.label}
            label={item.label}
            value={item.value}
            maxValue={maxVal}
            color={BAR_COLORS[index % BAR_COLORS.length]}
          />
        ))}
      </View>
      <Text style={styles.unit}>Values in Kg CO₂ Eqv</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: CardDark,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: TextPrimary,
  },
  bars: {
    marginTop: 4,
  },
  unit: {
    fontSize: 10,
    color: TextSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
});
