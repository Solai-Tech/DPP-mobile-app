import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Accent, AccentDim, CardDark, TextPrimary, TextSecondary, TextMuted } from '../theme/colors';
import { s, vs, ms } from '../utils/scale';

interface Props {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  hasDownload?: boolean;
  onPress?: () => void;
}

export default function DocumentCard({
  icon,
  title,
  subtitle,
  hasDownload = false,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <MaterialIcons name={icon} size={ms(18)} color={Accent} />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      {hasDownload ? (
        <View style={styles.downloadBadge}>
          <Text style={styles.downloadText}>Download</Text>
        </View>
      ) : (
        <Text style={styles.notSpecified}>Not specified</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CardDark,
    borderRadius: s(12),
    padding: s(16),
    marginHorizontal: s(24),
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: s(36),
    height: s(36),
    borderRadius: s(8),
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textCol: {
    marginLeft: s(12),
    flex: 1,
  },
  title: {
    fontWeight: '600',
    fontSize: ms(14),
    color: TextPrimary,
  },
  subtitle: {
    fontSize: ms(11),
    color: TextSecondary,
  },
  downloadBadge: {
    backgroundColor: Accent,
    borderRadius: s(20),
    paddingHorizontal: s(14),
    paddingVertical: vs(6),
  },
  downloadText: {
    color: '#0A1A14',
    fontSize: ms(12),
    fontWeight: '600',
  },
  notSpecified: {
    fontSize: ms(12),
    color: TextMuted,
  },
});
