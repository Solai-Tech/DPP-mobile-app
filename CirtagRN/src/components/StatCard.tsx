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

export default function StatCard({ icon, label, value, unit }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <MaterialIcons name={icon} size={ms(18)} color={Accent} />
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
    borderRadius: s(16),
    padding: s(14),
    alignItems: 'center',
  },
  iconCircle: {
    width: s(36),
    height: s(36),
    borderRadius: s(18),
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(8),
  },
  value: {
    fontSize: ms(22),
    fontWeight: '800',
    color: TextPrimary,
  },
  unit: {
    fontSize: ms(11),
    color: Accent,
    fontWeight: '600',
    marginTop: vs(1),
  },
  label: {
    fontSize: ms(11),
    color: TextSecondary,
    marginTop: vs(4),
    textAlign: 'center',
  },
});
