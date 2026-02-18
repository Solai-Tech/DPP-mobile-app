import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Accent, AccentDim, CardDark, CardLight, TextPrimary, TextSecondary } from '../theme/colors';

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
          <MaterialIcons name="support-agent" size={18} color={Accent} />
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
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AccentDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  botBubble: {
    backgroundColor: CardDark,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: Accent,
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: 14,
    color: TextPrimary,
    lineHeight: 20,
  },
  userText: {
    color: '#0A1A14',
  },
});
