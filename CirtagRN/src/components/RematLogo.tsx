import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextPrimary } from '../theme/colors';
import { s, vs, ms } from '../utils/scale';

interface Props {
  size?: 'small' | 'medium' | 'large';
}

const SIZES = {
  small: { fontSize: 18, borderWidth: 1.5, paddingH: 8, paddingV: 4 },
  medium: { fontSize: 24, borderWidth: 2, paddingH: 12, paddingV: 6 },
  large: { fontSize: 32, borderWidth: 2.5, paddingH: 16, paddingV: 8 },
};

export default function RematLogo({ size = 'medium' }: Props) {
  const sizeConfig = SIZES[size];
  return (
    <View style={[styles.container, {
      borderWidth: sizeConfig.borderWidth,
      paddingHorizontal: s(sizeConfig.paddingH),
      paddingVertical: vs(sizeConfig.paddingV),
    }]}>
      <Text style={[styles.text, { fontSize: ms(sizeConfig.fontSize) }]}>ReMat</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: TextPrimary,
    borderRadius: s(4),
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '400',
    color: TextPrimary,
    letterSpacing: 0.5,
  },
});
