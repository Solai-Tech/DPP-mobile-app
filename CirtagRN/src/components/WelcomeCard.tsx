import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CardDark, Accent, TextPrimary, TextSecondary, AccentDim } from '../theme/colors';

interface Props {
  name: string;
  company: string;
}

export default function WelcomeCard({ name, company }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <MaterialIcons name="person" size={28} color={Accent} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.company}>{company}</Text>
      </View>
      <MaterialIcons name="notifications-none" size={24} color={TextSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CardDark,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textCol: {
    flex: 1,
    marginLeft: 12,
  },
  greeting: {
    fontSize: 12,
    color: TextSecondary,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: TextPrimary,
  },
  company: {
    fontSize: 12,
    color: TextSecondary,
    marginTop: 1,
  },
});
