import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useProductChat } from '../src/hooks/useProductChat';
import { ChatMessage } from '../src/types/Ticket';
import { s, vs, ms } from '../src/utils/scale';

// Botanical Fresh theme colors
const CreamBg = '#F7F5F0';
const HeaderBg = '#5A8C5A';
const White = '#FFFFFF';
const SageAccent = '#5A8C5A';
const SageLight = '#7BAF7B';
const SageTint = 'rgba(90,140,90,0.08)';
const UserBubbleBg = 'rgba(90,140,90,0.10)';
const BotBubbleBg = '#FFFFFF';
const TextDark = '#2C3E2D';
const TextGray = 'rgba(44,62,45,0.65)';
const InputBg = '#F0EDE6';
const Border = 'rgba(44,62,45,0.1)';

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

const QUICK_REPLIES = [
  'Tell me about this product',
  'What certifications does it have?',
  'What is the carbon footprint?',
  'Where can I find the datasheet?',
];

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      );
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 200);
    const a3 = animate(dot3, 400);
    a1.start();
    a2.start();
    a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [dot1, dot2, dot3]);

  const dotStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
  });

  return (
    <View style={styles.typingRow}>
      <View style={styles.botAvatar}>
        <Image source={require('../assets/get-support-icon.png')} style={{ width: ms(20), height: ms(20) }} />
      </View>
      <View style={styles.typingBubble}>
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View key={i} style={[styles.typingDot, dotStyle(d)]} />
        ))}
      </View>
    </View>
  );
}

export default function ProductChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { productId, productName, productUrl } = useLocalSearchParams<{
    productId: string;
    productName: string;
    productUrl: string;
  }>();
  const numericId = Number(productId);
  const safeName = productName || 'Product';
  const safeUrl = productUrl || '';

  const { messages, isTyping, sendMessage } = useProductChat(numericId, safeUrl, safeName);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput('');
    sendMessage(text);
  };

  const handleQuickReply = (text: string) => {
    if (isTyping) return;
    sendMessage(text);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, isTyping]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Image source={require('../assets/get-support-icon.png')} style={{ width: ms(20), height: ms(20) }} />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          <FormattedText text={item.message} style={[styles.bubbleText, isUser && styles.userBubbleText]} />
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={ms(22)} color={White} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{safeName} Assistant</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={[styles.messageList, { paddingBottom: vs(8) }]}
        ListHeaderComponent={
          messages.length === 0 && !isTyping ? (
            <View style={styles.welcomeSection}>
              <View style={styles.welcomeIconCircle}>
                <Image source={require('../assets/get-support-icon.png')} style={{ width: ms(36), height: ms(36) }} />
              </View>
              <Text style={styles.welcomeTitle}>{safeName} Assistant</Text>
              <Text style={styles.welcomeSubtitle}>Ask me anything about this product</Text>
              <View style={styles.quickReplies}>
                {QUICK_REPLIES.map((q, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.quickReplyChip}
                    onPress={() => handleQuickReply(q)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quickReplyText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null
        }
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
      />

      {/* Input Bar */}
      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, vs(8)) }]}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={TextGray}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline={false}
          editable={!isTyping}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || isTyping) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || isTyping}
          activeOpacity={0.7}
        >
          <MaterialIcons name="send" size={ms(20)} color={White} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CreamBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HeaderBg,
    paddingHorizontal: s(8),
    paddingVertical: vs(10),
  },
  backBtn: {
    padding: s(8),
  },
  headerCenter: {
    flex: 1,
    marginLeft: s(4),
  },
  headerTitle: {
    fontSize: ms(16),
    fontWeight: '700',
    color: White,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(2),
  },
  onlineDot: {
    width: s(6),
    height: s(6),
    borderRadius: s(3),
    backgroundColor: '#A8D5A8',
    marginRight: s(4),
  },
  onlineText: {
    fontSize: ms(11),
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  messageList: {
    paddingHorizontal: s(12),
    paddingTop: vs(12),
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: vs(10),
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: SageTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(8),
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: s(16),
    paddingHorizontal: s(14),
    paddingVertical: vs(10),
  },
  botBubble: {
    backgroundColor: BotBubbleBg,
    borderBottomLeftRadius: s(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: UserBubbleBg,
    borderBottomRightRadius: s(4),
    marginLeft: 'auto',
  },
  bubbleText: {
    fontSize: ms(14),
    color: TextDark,
    lineHeight: ms(20),
  },
  userBubbleText: {
    color: SageAccent,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: vs(10),
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: BotBubbleBg,
    borderRadius: s(16),
    borderBottomLeftRadius: s(4),
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
    gap: s(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  typingDot: {
    width: s(8),
    height: s(8),
    borderRadius: s(4),
    backgroundColor: TextGray,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: vs(32),
  },
  welcomeIconCircle: {
    width: s(60),
    height: s(60),
    borderRadius: s(30),
    backgroundColor: SageTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  welcomeTitle: {
    fontSize: ms(18),
    fontWeight: '700',
    color: TextDark,
  },
  welcomeSubtitle: {
    fontSize: ms(13),
    color: TextGray,
    marginTop: vs(4),
  },
  quickReplies: {
    marginTop: vs(20),
    gap: vs(8),
    width: '100%',
    paddingHorizontal: s(8),
  },
  quickReplyChip: {
    backgroundColor: White,
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: SageAccent,
    paddingHorizontal: s(16),
    paddingVertical: vs(10),
    alignItems: 'center',
  },
  quickReplyText: {
    fontSize: ms(13),
    color: SageAccent,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    paddingTop: vs(8),
    backgroundColor: White,
    borderTopWidth: 1,
    borderTopColor: Border,
  },
  textInput: {
    flex: 1,
    backgroundColor: InputBg,
    borderRadius: s(24),
    paddingHorizontal: s(16),
    paddingVertical: vs(10),
    fontSize: ms(14),
    color: TextDark,
    maxHeight: vs(100),
  },
  sendBtn: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: SageAccent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: s(8),
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
