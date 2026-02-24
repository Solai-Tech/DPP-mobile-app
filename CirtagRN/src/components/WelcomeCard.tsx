import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CardDark, Accent, TextPrimary, TextSecondary, AccentDim } from '../theme/colors';
import { s, vs, ms } from '../utils/scale';

interface Props {
  name: string;
  company: string;
}

export default function WelcomeCard({ name, company }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <MaterialIcons name="person" size={ms(28)} color={Accent} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.company}>{company}</Text>
      </View>
      <MaterialIcons name="notifications-none" size={ms(24)} color={TextSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CardDark,
    borderRadius: s(16),
    padding: s(16),
    marginHorizontal: s(20),
  },
  avatar: {
    width: s(48),
    height: s(48),
    borderRadius: s(24),
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textCol: {
    flex: 1,
    marginLeft: s(12),
  },
  greeting: {
    fontSize: ms(12),
    color: TextSecondary,
  },
  name: {
    fontSize: ms(16),
    fontWeight: '700',
    color: TextPrimary,
  },
  company: {
    fontSize: ms(12),
    color: TextSecondary,
    marginTop: vs(1),
  },
});
