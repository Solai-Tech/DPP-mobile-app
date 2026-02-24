import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Accent, AccentDim, CardDark, TextPrimary } from '../theme/colors';
import { s, vs, ms } from '../utils/scale';

interface Props {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  children: React.ReactNode;
}

export default function SpecSection({ icon, title, children }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <MaterialIcons name={icon} size={ms(24)} color={Accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CardDark,
    borderRadius: s(12),
    padding: s(16),
    marginHorizontal: s(24),
    alignItems: 'center',
  },
  iconBox: {
    width: s(44),
    height: s(44),
    borderRadius: s(12),
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    fontSize: ms(15),
    color: TextPrimary,
    textAlign: 'center',
    marginTop: vs(10),
    marginBottom: vs(8),
  },
});
