import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Accent } from '../theme/colors';
import { typography } from '../theme/typography';
import { s, vs, ms } from '../utils/scale';

export default function LoadingOverlay() {
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color={Accent} />
      <Text style={styles.title}>Fetching Product Details</Text>
      <Text style={styles.subtitle}>Please wait...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.titleMedium,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: vs(20),
  },
  subtitle: {
    ...typography.bodyMedium,
    color: 'rgba(255,255,255,0.7)',
    marginTop: vs(4),
  },
});
