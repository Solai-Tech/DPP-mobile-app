import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Accent, TextPrimary, TextSecondary } from '../theme/colors';

interface Props {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
}

export default function EmissionBar({ label, value, maxValue, color = Accent }: Props) {
  const widthPercent = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;

  return (
    <View style={styles.row}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${widthPercent}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.value}>{value.toFixed(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    width: 90,
    fontSize: 11,
    color: TextSecondary,
    fontWeight: '500',
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  value: {
    width: 35,
    fontSize: 11,
    color: TextPrimary,
    fontWeight: '600',
    textAlign: 'right',
  },
});
