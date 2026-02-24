import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Accent, AccentDim, CardDark, CardLight, TextPrimary, TextSecondary } from '../theme/colors';
import { s, vs, ms } from '../utils/scale';

interface Props {
  message: string;
  sender: 'user' | 'bot';
  timestamp?: number;
}

export default function ChatBubble({ message, sender, timestamp }: Props) {
  const isUser = sender === 'user';

  return (
    <View style={[styles.row, isUser && styles.rowRight]}>
      {!isUser && (
        <View style={styles.avatar}>
          <MaterialIcons name="support-agent" size={ms(18)} color={Accent} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.text, isUser && styles.userText]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: vs(10),
    paddingHorizontal: s(16),
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(8),
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: s(16),
    padding: s(12),
  },
  botBubble: {
    backgroundColor: CardDark,
    borderBottomLeftRadius: s(4),
  },
  userBubble: {
    backgroundColor: Accent,
    borderBottomRightRadius: s(4),
  },
  text: {
    fontSize: ms(14),
    color: TextPrimary,
    lineHeight: ms(20),
  },
  userText: {
    color: '#0A1A14',
  },
});
