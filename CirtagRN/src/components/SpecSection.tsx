import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Accent, AccentDim, CardDark, TextPrimary } from '../theme/colors';

interface Props {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  children: React.ReactNode;
}

export default function SpecSection({ icon, title, children }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <MaterialIcons name={icon} size={24} color={Accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CardDark,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    fontSize: 15,
    color: TextPrimary,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
});
