import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Accent, AccentDim } from '../theme/colors';
import { s, vs, ms } from '../utils/scale';

interface Props {
  label?: string;
}

export default function VerifiedBadge({ label = 'Verified Product' }: Props) {
  return (
    <View style={styles.badge}>
      <MaterialIcons name="verified" size={ms(16)} color={Accent} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AccentDim,
    borderRadius: s(20),
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    gap: s(5),
    alignSelf: 'center',
  },
  text: {
    fontSize: ms(12),
    fontWeight: '700',
    color: Accent,
  },
});
