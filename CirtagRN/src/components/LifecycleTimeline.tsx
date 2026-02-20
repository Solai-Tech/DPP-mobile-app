import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CardDark, Accent, AccentDim, TextPrimary, TextSecondary, TextMuted } from '../theme/colors';

interface Stage {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
}

const STAGES: Stage[] = [
  { icon: 'terrain', label: 'Raw Mat.', status: 'completed' },
  { icon: 'precision-manufacturing', label: 'Mfg', status: 'completed' },
  { icon: 'local-shipping', label: 'Transit', status: 'completed' },
  { icon: 'store', label: 'Retail', status: 'current' },
  { icon: 'recycling', label: 'EOL', status: 'upcoming' },
];

export default function LifecycleTimeline() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Product Lifecycle</Text>
      <View style={styles.timeline}>
        {STAGES.map((stage, index) => {
          const isActive = stage.status !== 'upcoming';
          const isCurrent = stage.status === 'current';
          return (
            <React.Fragment key={stage.label}>
              <View style={styles.stageCol}>
                <View
                  style={[
                    styles.iconCircle,
                    isActive ? styles.activeCircle : styles.inactiveCircle,
                    isCurrent && styles.currentCircle,
                  ]}
                >
                  <MaterialIcons
                    name={stage.icon}
                    size={16}
                    color={isActive ? Accent : TextMuted}
                  />
                </View>
                <Text
                  style={[
                    styles.label,
                    { color: isActive ? TextPrimary : TextMuted },
                  ]}
                >
                  {stage.label}
                </Text>
              </View>
              {index < STAGES.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    { backgroundColor: isActive ? Accent : TextMuted },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: CardDark,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: TextPrimary,
    marginBottom: 16,
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  stageCol: {
    alignItems: 'center',
    width: 50,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCircle: {
    backgroundColor: AccentDim,
  },
  inactiveCircle: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  currentCircle: {
    borderWidth: 2,
    borderColor: Accent,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  connector: {
    height: 2,
    flex: 1,
    marginTop: 16,
    borderRadius: 1,
    opacity: 0.4,
  },
});
