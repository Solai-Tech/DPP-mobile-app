import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { s, vs, ms } from '../utils/scale';

interface Props {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  gradientColors: [string, string];
  onPress: () => void;
}

export default function HomeActionCard({
  icon,
  title,
  subtitle,
  gradientColors,
  onPress,
}: Props) {
  return (
    <TouchableOpacity style={styles.wrapper} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={gradientColors} style={styles.card}>
        <View style={styles.iconCircle}>
          <MaterialIcons name={icon} size={ms(28)} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: s(20),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  card: {
    flex: 1,
    borderRadius: s(20),
    padding: s(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: s(52),
    height: s(52),
    borderRadius: s(26),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: ms(16),
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: vs(14),
  },
  subtitle: {
    fontSize: ms(11),
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    marginTop: vs(4),
  },
});
