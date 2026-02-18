import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CardDark, Accent, AccentDim, TextPrimary, TextSecondary } from '../theme/colors';

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
        <MaterialIcons name={icon} size={16} color={Accent} />
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
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: TextPrimary,
  },
  unit: {
    fontSize: 10,
    color: Accent,
    fontWeight: '600',
  },
  label: {
    fontSize: 10,
    color: TextSecondary,
    marginTop: 3,
    textAlign: 'center',
  },
});
