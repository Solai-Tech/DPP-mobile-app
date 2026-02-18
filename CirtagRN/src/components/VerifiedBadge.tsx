import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Accent, AccentDim } from '../theme/colors';

interface Props {
  label?: string;
}

export default function VerifiedBadge({ label = 'Verified Product' }: Props) {
  return (
    <View style={styles.badge}>
      <MaterialIcons name="verified" size={16} color={Accent} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AccentDim,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 5,
    alignSelf: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: Accent,
  },
});
