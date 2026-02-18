import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextPrimary, TextSecondary } from '../theme/colors';

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
    paddingVertical: 2,
  },
  label: {
    fontSize: 13,
    color: TextSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    color: TextPrimary,
  },
});
