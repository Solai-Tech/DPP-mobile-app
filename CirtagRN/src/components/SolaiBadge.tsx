import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  icon: keyof typeof MaterialIcons.glyphMap;
  text: string;
  bgColor: string;
  textColor: string;
}

export default function SolaiBadge({ icon, text, bgColor, textColor }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: bgColor, borderColor: `${textColor}33` }]}>
      <MaterialIcons name={icon} size={16} color={textColor} />
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
