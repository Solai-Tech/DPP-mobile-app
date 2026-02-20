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

export default function StatCard({ icon, label, value, unit }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <MaterialIcons name={icon} size={18} color={Accent} />
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
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: TextPrimary,
  },
  unit: {
    fontSize: 11,
    color: Accent,
    fontWeight: '600',
    marginTop: 1,
  },
  label: {
    fontSize: 11,
    color: TextSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
