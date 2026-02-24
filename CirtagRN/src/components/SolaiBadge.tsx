import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { s, vs, ms } from '../utils/scale';

interface Props {
  icon: keyof typeof MaterialIcons.glyphMap;
  text: string;
  bgColor: string;
  textColor: string;
}

export default function SolaiBadge({ icon, text, bgColor, textColor }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: bgColor, borderColor: `${textColor}33` }]}>
      <MaterialIcons name={icon} size={ms(16)} color={textColor} />
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: s(24),
    borderWidth: 1,
    paddingHorizontal: s(16),
    paddingVertical: vs(8),
    gap: s(6),
  },
  text: {
    fontSize: ms(13),
    fontWeight: '600',
  },
});
