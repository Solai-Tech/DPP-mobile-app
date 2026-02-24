import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextPrimary, TextSecondary } from '../theme/colors';
import { s, vs, ms } from '../utils/scale';

interface Props {
  label: string;
  value: string;
}

export default function SpecRow({ label, value }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}: </Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: vs(2),
  },
  label: {
    fontSize: ms(13),
    color: TextSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: ms(13),
    color: TextPrimary,
  },
});
