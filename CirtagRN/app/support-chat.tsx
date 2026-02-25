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

const LightBg = '#F5F7FA';
const White = '#FFFFFF';
const GreenAccent = '#1B7A3D';
const GreenTint = 'rgba(0,230,118,0.08)';
const TextBlack = '#1A1A1A';
const TextGray = '#6B6B6B';
const TextMutedLight = '#999999';
const Border = '#E8ECF0';
const TextPrimary = '#E8F5E9';

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
            <MaterialIcons name="arrow-back-ios-new" size={ms(18)} color={TextPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support Chat</Text>
        </View>

        {/* Agent Header */}
        <View style={styles.agentHeader}>
          <View style={styles.agentAvatarContainer}>
            <View style={styles.agentAvatar}>
              <MaterialIcons name="support-agent" size={ms(22)} color={GreenAccent} />
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
                <MaterialIcons name="support-agent" size={ms(32)} color={GreenAccent} />
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
                    <MaterialIcons name="support-agent" size={ms(14)} color={GreenAccent} />
                  </View>
                  <View style={styles.botBubble}>
                    <Text style={styles.botBubbleText}>{msg.message}</Text>
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
    backgroundColor: LightBg,
  },
  flex: {
    flex: 1,
  },
  header: {
    height: vs(48),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    backgroundColor: '#0A1A14',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
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
    color: TextPrimary,
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
    backgroundColor: GreenTint,
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
    backgroundColor: '#00E676',
    borderWidth: 2,
    borderColor: LightBg,
  },
  agentInfo: {
    marginLeft: s(12),
  },
  agentName: {
    fontSize: ms(15),
    fontWeight: '700',
    color: TextBlack,
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
    backgroundColor: GreenTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(16),
  },
  welcomeTitle: {
    fontSize: ms(18),
    fontWeight: '700',
    color: TextBlack,
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
    backgroundColor: GreenTint,
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
    color: TextBlack,
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
    backgroundColor: GreenTint,
  },
  userBubbleText: {
    fontSize: ms(14),
    color: GreenAccent,
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
    borderColor: GreenAccent,
    borderRadius: s(20),
    paddingHorizontal: s(14),
    paddingVertical: vs(8),
  },
  quickReplyText: {
    fontSize: ms(13),
    fontWeight: '600',
    color: GreenAccent,
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
    backgroundColor: LightBg,
    borderRadius: s(20),
    paddingHorizontal: s(16),
    paddingVertical: vs(10),
    fontSize: ms(14),
    color: TextBlack,
    borderWidth: 1,
    borderColor: Border,
  },
  sendBtn: {
    width: s(36),
    height: s(36),
    borderRadius: s(18),
    backgroundColor: GreenAccent,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
