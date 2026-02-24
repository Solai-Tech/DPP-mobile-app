import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Accent, AccentDim, CardDark, TextPrimary } from '../theme/colors';
import { s, vs, ms } from '../utils/scale';

interface Props {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  variant?: 'primary' | 'secondary';
  onPress: () => void;
}

export default function ActionButton({
  icon,
  label,
  variant = 'secondary',
  onPress,
}: Props) {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      style={[styles.button, isPrimary ? styles.primaryBg : styles.secondaryBg]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialIcons
        name={icon}
        size={ms(18)}
        color={isPrimary ? '#0A1A14' : Accent}
      />
      <Text style={[styles.label, isPrimary ? styles.primaryText : styles.secondaryText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(12),
    paddingVertical: vs(12),
    paddingHorizontal: s(16),
    gap: s(8),
    flex: 1,
  },
  primaryBg: {
    backgroundColor: Accent,
  },
  secondaryBg: {
    backgroundColor: AccentDim,
  },
  label: {
    fontSize: ms(13),
    fontWeight: '700',
  },
  primaryText: {
    color: '#0A1A14',
  },
  secondaryText: {
    color: Accent,
  },
});
