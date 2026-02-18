import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CardDark, Accent, AccentDim, TextPrimary, TextMuted } from '../theme/colors';

type ScanType = 'qr' | 'barcode';

interface Props {
  activeType: ScanType;
  onToggle: (type: ScanType) => void;
}

export default function ScanTypeToggle({ activeType, onToggle }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, activeType === 'qr' && styles.activeTab]}
        onPress={() => onToggle('qr')}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="qr-code"
          size={20}
          color={activeType === 'qr' ? Accent : TextMuted}
        />
        <Text style={[styles.label, activeType === 'qr' && styles.activeLabel]}>
          QR Code
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeType === 'barcode' && styles.activeTab]}
        onPress={() => onToggle('barcode')}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="view-week"
          size={20}
          color={activeType === 'barcode' ? Accent : TextMuted}
        />
        <Text
          style={[styles.label, activeType === 'barcode' && styles.activeLabel]}
        >
          Barcode
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: CardDark,
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  activeTab: {
    backgroundColor: AccentDim,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: TextMuted,
  },
  activeLabel: {
    color: Accent,
  },
});
