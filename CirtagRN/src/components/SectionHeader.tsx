import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Accent, AccentDim, TextPrimary } from '../theme/colors';
import { typography } from '../theme/typography';
import { s, vs, ms } from '../utils/scale';

interface Props {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

export default function SectionHeader({ title, icon }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <MaterialIcons name={icon} size={ms(20)} color={Accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(20),
  },
  iconBox: {
    width: s(36),
    height: s(36),
    borderRadius: s(10),
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.titleMedium,
    fontWeight: '700',
    color: TextPrimary,
    marginLeft: s(10),
  },
});
