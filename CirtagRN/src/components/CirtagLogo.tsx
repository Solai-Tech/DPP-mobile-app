import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Accent, TextPrimary } from '../theme/colors';
import { s, vs, ms } from '../utils/scale';

interface Props {
  size?: 'small' | 'medium' | 'large';
}

const SIZES = {
  small: { fontSize: 18, iconSize: 16 },
  medium: { fontSize: 24, iconSize: 20 },
  large: { fontSize: 32, iconSize: 28 },
};

export default function CirtagLogo({ size = 'medium' }: Props) {
  const sizeConfig = SIZES[size];
  return (
    <View style={styles.container}>
      <MaterialIcons name="recycling" size={ms(sizeConfig.iconSize)} color={Accent} />
      <Text style={[styles.cirt, { fontSize: ms(sizeConfig.fontSize) }]}>CIRT</Text>
      <Text style={[styles.ag, { fontSize: ms(sizeConfig.fontSize) }]}>AG</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(4),
  },
  cirt: {
    fontWeight: '800',
    color: TextPrimary,
    letterSpacing: 1,
  },
  ag: {
    fontWeight: '800',
    color: Accent,
    letterSpacing: 1,
  },
});
