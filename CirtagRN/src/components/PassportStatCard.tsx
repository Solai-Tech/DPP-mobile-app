import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CardDark, Accent, AccentDim, TextPrimary, TextSecondary } from '../theme/colors';
import { s, vs, ms } from '../utils/scale';

interface Props {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  unit?: string;
}

export default function PassportStatCard({ icon, label, value, unit }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <MaterialIcons name={icon} size={ms(16)} color={Accent} />
      </View>
      <Text style={styles.value}>{value}</Text>
      {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: CardDark,
    borderRadius: s(14),
    padding: s(12),
    alignItems: 'center',
  },
  iconCircle: {
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(6),
  },
  value: {
    fontSize: ms(18),
    fontWeight: '800',
    color: TextPrimary,
  },
  unit: {
    fontSize: ms(10),
    color: Accent,
    fontWeight: '600',
  },
  label: {
    fontSize: ms(10),
    color: TextSecondary,
    marginTop: vs(3),
    textAlign: 'center',
  },
});
