import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BackgroundDark, BackgroundMid } from '../theme/colors';

interface Props {
  children: React.ReactNode;
}

export default function GradientBackground({ children }: Props) {
  return (
    <LinearGradient
      colors={[BackgroundDark, BackgroundMid, BackgroundDark]}
      locations={[0, 0.5, 1]}
      style={styles.gradient}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
