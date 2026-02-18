import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Accent, AccentDim, TextPrimary, TextSecondary } from '../theme/colors';
import { typography } from '../theme/typography';

export default function EmptyState() {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialIcons name="qr-code-scanner" size={48} color={Accent} />
      </View>
      <Text style={styles.title}>No Scans Yet</Text>
      <Text style={styles.subtitle}>
        Scan a QR code to see your product{'\n'}history appear here
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.headlineSmall,
    fontWeight: '700',
    color: TextPrimary,
    marginTop: 24,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: TextSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
});
