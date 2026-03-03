import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTickets } from '../src/hooks/useTickets';
import { s, vs, ms } from '../src/utils/scale';

function FormattedText({ text, style }: { text: string; style: any }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text style={style}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <Text key={i} style={{ fontWeight: '700' }}>{part.slice(2, -2)}</Text>;
        }
        return part;
      })}
    </Text>
  );
}

const CreamBg = '#F7F5F0';
const White = '#FFFFFF';
const SageAccent = '#5A8C5A';
const SageTint = 'rgba(90,140,90,0.08)';
const TextDark = '#2C3E2D';
const TextGray = 'rgba(44,62,45,0.65)';
const TextMutedLight = 'rgba(44,62,45,0.4)';
const Border = 'rgba(44,62,45,0.1)';

const QUICK_REPLIES = [
  'Track my order',
  'CO\u2082 report',
  'Product issue',
  'Contact human',
];

export default function SupportChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { chatMessages, sendMessage } = useTickets();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [chatMessages]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    sendMessage(text);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back-ios-new" size={ms(18)} color={White} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support Chat</Text>
        </View>

        {/* Agent Header */}
        <View style={styles.agentHeader}>
          <View style={styles.agentAvatarContainer}>
            <View style={styles.agentAvatar}>
              <MaterialIcons name="support-agent" size={ms(22)} color={SageAccent} />
            </View>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.agentInfo}>
            <Text style={styles.agentName}>CIRTAG Support</Text>
            <Text style={styles.agentStatus}>Online, replies in ~2 min</Text>
          </View>
        </View>

        {/* Chat Area */}
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {chatMessages.length === 0 && (
            <View style={styles.welcomeChat}>
              <View style={styles.welcomeIcon}>
                <MaterialIcons name="support-agent" size={ms(32)} color={SageAccent} />
              </View>
              <Text style={styles.welcomeTitle}>CirTag Support</Text>
              <Text style={styles.welcomeSubtext}>
                Hi there! How can we help you today? Ask about product
                verification, CO{'\u2082'} data, or raise a support ticket.
              </Text>
            </View>
          )}
          {chatMessages.map((msg) => (
            <View key={msg.id}>
              {msg.sender === 'bot' ? (
                <View style={styles.botBubbleRow}>
                  <View style={styles.botAvatarSmall}>
                    <MaterialIcons name="support-agent" size={ms(14)} color={SageAccent} />
                  </View>
                  <View style={styles.botBubble}>
                    <FormattedText text={msg.message} style={styles.botBubbleText} />
                  </View>
                </View>
              ) : (
                <View style={styles.userBubbleRow}>
                  <View style={styles.userBubble}>
                    <Text style={styles.userBubbleText}>{msg.message}</Text>
                  </View>
                </View>
              )}
            </View>
          ))}

          {chatMessages.length === 0 && (
            <View style={styles.quickRepliesSection}>
              <Text style={styles.quickRepliesLabel}>Quick replies</Text>
              <View style={styles.quickRepliesRow}>
                {QUICK_REPLIES.map((reply) => (
                  <TouchableOpacity
                    key={reply}
                    style={styles.quickReplyBtn}
                    onPress={() => sendMessage(reply)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quickReplyText}>{reply}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Chat Input */}
        <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, vs(8)) }]}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your message..."
            placeholderTextColor={TextMutedLight}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <MaterialIcons name="send" size={ms(18)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CreamBg,
  },
  flex: {
    flex: 1,
  },
  header: {
    height: vs(48),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    backgroundColor: SageAccent,
  },
  backBtn: {
    width: s(34),
    height: s(34),
    borderRadius: s(17),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(8),
  },
  headerTitle: {
    flex: 1,
    fontSize: ms(16),
    fontWeight: '700',
    color: White,
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: Border,
  },
  agentAvatarContainer: {
    position: 'relative',
  },
  agentAvatar: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: SageTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: s(10),
    height: s(10),
    borderRadius: s(5),
    backgroundColor: SageAccent,
    borderWidth: 2,
    borderColor: CreamBg,
  },
  agentInfo: {
    marginLeft: s(12),
  },
  agentName: {
    fontSize: ms(15),
    fontWeight: '700',
    color: TextDark,
  },
  agentStatus: {
    fontSize: ms(12),
    color: TextGray,
    marginTop: vs(1),
  },
  chatContent: {
    paddingVertical: vs(12),
  },
  welcomeChat: {
    alignItems: 'center',
    padding: s(32),
  },
  welcomeIcon: {
    width: s(64),
    height: s(64),
    borderRadius: s(32),
    backgroundColor: SageTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(16),
  },
  welcomeTitle: {
    fontSize: ms(18),
    fontWeight: '700',
    color: TextDark,
  },
  welcomeSubtext: {
    fontSize: ms(14),
    color: TextGray,
    textAlign: 'center',
    lineHeight: ms(20),
    marginTop: vs(8),
    paddingHorizontal: s(20),
  },
  botBubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: vs(10),
    paddingHorizontal: s(16),
  },
  botAvatarSmall: {
    width: s(28),
    height: s(28),
    borderRadius: s(14),
    backgroundColor: SageTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(8),
  },
  botBubble: {
    maxWidth: '75%',
    borderRadius: s(16),
    borderBottomLeftRadius: s(4),
    padding: s(12),
    backgroundColor: White,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  botBubbleText: {
    fontSize: ms(14),
    color: TextDark,
    lineHeight: ms(20),
  },
  userBubbleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: vs(10),
    paddingHorizontal: s(16),
  },
  userBubble: {
    maxWidth: '75%',
    borderRadius: s(16),
    borderBottomRightRadius: s(4),
    padding: s(12),
    backgroundColor: SageTint,
  },
  userBubbleText: {
    fontSize: ms(14),
    color: SageAccent,
    lineHeight: ms(20),
  },
  quickRepliesSection: {
    paddingHorizontal: s(20),
    marginTop: vs(8),
  },
  quickRepliesLabel: {
    fontSize: ms(12),
    color: TextMutedLight,
    marginBottom: vs(8),
  },
  quickRepliesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(8),
  },
  quickReplyBtn: {
    borderWidth: 1.5,
    borderColor: SageAccent,
    borderRadius: s(20),
    paddingHorizontal: s(14),
    paddingVertical: vs(8),
  },
  quickReplyText: {
    fontSize: ms(13),
    fontWeight: '600',
    color: SageAccent,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    paddingTop: vs(8),
    gap: s(8),
    backgroundColor: White,
    borderTopWidth: 1,
    borderTopColor: Border,
  },
  textInput: {
    flex: 1,
    backgroundColor: CreamBg,
    borderRadius: s(20),
    paddingHorizontal: s(16),
    paddingVertical: vs(10),
    fontSize: ms(14),
    color: TextDark,
    borderWidth: 1,
    borderColor: Border,
  },
  sendBtn: {
    width: s(36),
    height: s(36),
    borderRadius: s(18),
    backgroundColor: SageAccent,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
