import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ticketDao from '../src/database/ticketDao';
import * as dao from '../src/database/scannedProductDao';
import { getFlowiseChatReply } from '../src/utils/flowiseApi';
import { ChatMessage, Ticket } from '../src/types/Ticket';
import { s, vs, ms } from '../src/utils/scale';

const CreamBg = '#F7F5F0';
const White = '#FFFFFF';
const SageAccent = '#5A8C5A';
const SageTint = 'rgba(90,140,90,0.08)';
const TextDark = '#2C3E2D';
const TextGray = 'rgba(44,62,45,0.65)';
const TextMutedLight = 'rgba(44,62,45,0.4)';
const Border = 'rgba(44,62,45,0.1)';

export default function TicketDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
  const id = Number(ticketId);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const loadData = useCallback(async () => {
    const t = await ticketDao.getTicketById(id);
    setTicket(t);
    // Move any remaining chat messages for this product into this ticket
    if (t?.productId) {
      await ticketDao.moveGeneralChatToTicket(id, t.productId);
    }
    const msgs = await ticketDao.getChatMessages(id);
    setMessages(msgs);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');

    await ticketDao.insertChatMessage({
      ticketId: id,
      productId: null,
      message: text,
      sender: 'user',
      createdAt: Date.now(),
    });

    const msgs = await ticketDao.getChatMessages(id);
    setMessages(msgs);

    // Look up the ticket's product to determine which Flowise server to use
    const product = ticket?.productId ? await dao.getProductById(ticket.productId) : null;
    const productUrl = product?.rawValue || '';
    const productName = product?.productName || '';

    const reply = await getFlowiseChatReply(productUrl, text, undefined, productName);

    await ticketDao.insertChatMessage({
      ticketId: id,
      productId: null,
      message: reply.text,
      sender: 'bot',
      createdAt: Date.now(),
    });

    const updated = await ticketDao.getChatMessages(id);
    setMessages(updated);
  };

  const dateStr = ticket
    ? (() => {
        const d = new Date(ticket.createdAt);
        return `${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]}`;
      })()
    : '';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="chevron-left" size={ms(28)} color={TextDark} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {ticket?.title ?? 'Ticket'}
            </Text>
            <Text style={styles.headerSub}>
              {dateStr} {ticket ? `\u2022 ${ticket.status.replace('_', ' ')}` : ''}
            </Text>
          </View>
        </View>

        {/* Chat Area */}
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="chat-bubble-outline" size={ms(32)} color={TextMutedLight} />
              </View>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>
                Start a conversation about this ticket
              </Text>
            </View>
          )}
          {messages.map((msg) => (
            <View key={msg.id}>
              {msg.sender === 'bot' ? (
                <View style={styles.botBubbleRow}>
                  <View style={styles.botAvatarSmall}>
                    <MaterialIcons name="support-agent" size={ms(14)} color={SageAccent} />
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
        </ScrollView>

        {/* Input */}
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
  root: { flex: 1, backgroundColor: CreamBg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: Border,
    backgroundColor: White,
  },
  backBtn: { padding: s(4) },
  headerInfo: { flex: 1, marginLeft: s(8) },
  headerTitle: { fontSize: ms(17), fontWeight: '700', color: TextDark },
  headerSub: { fontSize: ms(12), color: TextGray, marginTop: vs(2), textTransform: 'capitalize' },
  chatContent: { paddingVertical: vs(12) },
  emptyState: { alignItems: 'center', padding: s(40) },
  emptyIcon: {
    width: s(64), height: s(64), borderRadius: s(32),
    backgroundColor: '#F0EDE6', justifyContent: 'center', alignItems: 'center', marginBottom: vs(12),
  },
  emptyText: { fontSize: ms(14), fontWeight: '600', color: TextGray },
  emptySubtext: { fontSize: ms(12), color: TextMutedLight, marginTop: vs(4), textAlign: 'center' },
  botBubbleRow: {
    flexDirection: 'row', alignItems: 'flex-end', marginBottom: vs(10), paddingHorizontal: s(16),
  },
  botAvatarSmall: {
    width: s(28), height: s(28), borderRadius: s(14),
    backgroundColor: SageTint, justifyContent: 'center', alignItems: 'center', marginRight: s(8),
  },
  botBubble: {
    maxWidth: '75%', borderRadius: s(16), borderBottomLeftRadius: s(4), padding: s(12),
    backgroundColor: White, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  botBubbleText: { fontSize: ms(14), color: TextDark, lineHeight: ms(20) },
  userBubbleRow: {
    flexDirection: 'row', justifyContent: 'flex-end', marginBottom: vs(10), paddingHorizontal: s(16),
  },
  userBubble: {
    maxWidth: '75%', borderRadius: s(16), borderBottomRightRadius: s(4), padding: s(12),
    backgroundColor: SageTint,
  },
  userBubbleText: { fontSize: ms(14), color: SageAccent, lineHeight: ms(20) },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: s(12), paddingTop: vs(8),
    gap: s(8), backgroundColor: White, borderTopWidth: 1, borderTopColor: Border,
  },
  textInput: {
    flex: 1, backgroundColor: CreamBg, borderRadius: s(20), paddingHorizontal: s(16),
    paddingVertical: vs(10), fontSize: ms(14), color: TextDark, borderWidth: 1, borderColor: Border,
  },
  sendBtn: {
    width: s(36), height: s(36), borderRadius: s(18),
    backgroundColor: SageAccent, justifyContent: 'center', alignItems: 'center',
  },
});
