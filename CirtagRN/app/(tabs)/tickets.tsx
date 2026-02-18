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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import ChatBubble from '../../src/components/ChatBubble';
import TicketCard from '../../src/components/TicketCard';
import { useTickets } from '../../src/hooks/useTickets';
import {
  Accent,
} from '../../src/theme/colors';

type TabMode = 'chat' | 'tickets';

// Light theme colors
const LightBg = '#F5F7FA';
const White = '#FFFFFF';
const GreenAccent = '#1B7A3D';
const BrightGreen = '#00E676';
const GreenTint = 'rgba(0,230,118,0.08)';
const TextBlack = '#1A1A1A';
const TextGray = '#6B6B6B';
const TextMutedLight = '#999999';
const Border = '#E8ECF0';

// Quick reply options
const QUICK_REPLIES = [
  'Track my order',
  'CO\u2082 report',
  'Product issue',
  'Contact human',
];

export default function TicketsScreen() {
  const insets = useSafeAreaInsets();
  const { tickets, chatMessages, sendMessage, createTicket } = useTickets();
  const [activeTab, setActiveTab] = useState<TabMode>('chat');
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (activeTab === 'chat') {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [chatMessages, activeTab]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    sendMessage(text);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const handleCreateTicket = () => {
    createTicket(
      'New Support Request',
      'Created from support chat'
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={60}
      >
        <View style={styles.flex}>
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Help & Support</Text>
            <Text style={styles.headerSubtitle}>
              Chat with us or track your support requests
            </Text>
          </View>

          {/* Tab Toggle */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
              onPress={() => setActiveTab('chat')}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'chat' && styles.activeTabLabel,
                ]}
              >
                Support Chat
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'tickets' && styles.activeTab]}
              onPress={() => setActiveTab('tickets')}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'tickets' && styles.activeTabLabel,
                ]}
              >
                My Tickets
              </Text>
              {tickets.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tickets.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {activeTab === 'chat' ? (
            <>
              {/* Support Agent Header */}
              <View style={styles.agentHeader}>
                <View style={styles.agentAvatarContainer}>
                  <View style={styles.agentAvatar}>
                    <MaterialIcons name="support-agent" size={22} color={GreenAccent} />
                  </View>
                  <View style={styles.onlineDot} />
                </View>
                <View style={styles.agentInfo}>
                  <Text style={styles.agentName}>CIRTAG Support</Text>
                  <Text style={styles.agentStatus}>
                    Online, replies in ~2 min
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
                {chatMessages.length === 0 && (
                  <View style={styles.welcomeChat}>
                    <View style={styles.welcomeIcon}>
                      <MaterialIcons name="support-agent" size={32} color={GreenAccent} />
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
                          <MaterialIcons name="support-agent" size={14} color={GreenAccent} />
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

                {/* Quick Replies */}
                {chatMessages.length === 0 && (
                  <View style={styles.quickRepliesSection}>
                    <Text style={styles.quickRepliesLabel}>Quick replies</Text>
                    <View style={styles.quickRepliesRow}>
                      {QUICK_REPLIES.map((reply) => (
                        <TouchableOpacity
                          key={reply}
                          style={styles.quickReplyBtn}
                          onPress={() => handleQuickReply(reply)}
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
              <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 8) }]}>
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
                  <MaterialIcons name="send" size={18} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.newTicketBtn} onPress={handleCreateTicket}>
                  <MaterialIcons name="add" size={16} color="#FFFFFF" />
                  <Text style={styles.newTicketText}>New Ticket</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Tickets List */}
              <ScrollView
                style={styles.flex}
                contentContainerStyle={styles.ticketsContent}
                showsVerticalScrollIndicator={false}
              >
                <TouchableOpacity style={styles.createTicketBtn} onPress={handleCreateTicket}>
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.createTicketText}>Create New Ticket</Text>
                </TouchableOpacity>
                <View style={{ height: 12 }} />
                {tickets.length === 0 ? (
                  <View style={styles.emptyTickets}>
                    <View style={styles.emptyIconCircle}>
                      <MaterialIcons name="confirmation-number" size={32} color={TextMutedLight} />
                    </View>
                    <Text style={styles.emptyText}>No tickets yet</Text>
                    <Text style={styles.emptySubtext}>
                      Create a ticket to track your support requests
                    </Text>
                  </View>
                ) : (
                  <View style={styles.ticketsList}>
                    {tickets.map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onPress={() => {}}
                      />
                    ))}
                  </View>
                )}
              </ScrollView>
            </>
          )}
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
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: TextBlack,
  },
  headerSubtitle: {
    fontSize: 14,
    color: TextGray,
    marginTop: 4,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: Border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: GreenAccent,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TextMutedLight,
  },
  activeTabLabel: {
    color: GreenAccent,
  },
  badge: {
    backgroundColor: BrightGreen,
    borderRadius: 8,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0A1A14',
  },
  // Agent Header
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Border,
  },
  agentAvatarContainer: {
    position: 'relative',
  },
  agentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GreenTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BrightGreen,
    borderWidth: 2,
    borderColor: LightBg,
  },
  agentInfo: {
    marginLeft: 12,
  },
  agentName: {
    fontSize: 15,
    fontWeight: '700',
    color: TextBlack,
  },
  agentStatus: {
    fontSize: 12,
    color: TextGray,
    marginTop: 1,
  },
  // Chat
  chatContent: {
    paddingVertical: 12,
  },
  welcomeChat: {
    alignItems: 'center',
    padding: 32,
  },
  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GreenTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TextBlack,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: TextGray,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  // Bot bubble (left, white bg)
  botBubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  botAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GreenTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  botBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    backgroundColor: White,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  botBubbleText: {
    fontSize: 14,
    color: TextBlack,
    lineHeight: 20,
  },
  // User bubble (right, light green bg)
  userBubbleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  userBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
    backgroundColor: GreenTint,
  },
  userBubbleText: {
    fontSize: 14,
    color: GreenAccent,
    lineHeight: 20,
  },
  // Quick Replies
  quickRepliesSection: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  quickRepliesLabel: {
    fontSize: 12,
    color: TextMutedLight,
    marginBottom: 8,
  },
  quickRepliesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickReplyBtn: {
    borderWidth: 1.5,
    borderColor: GreenAccent,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quickReplyText: {
    fontSize: 13,
    fontWeight: '600',
    color: GreenAccent,
  },
  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
    backgroundColor: White,
    borderTopWidth: 1,
    borderTopColor: Border,
  },
  textInput: {
    flex: 1,
    backgroundColor: LightBg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: TextBlack,
    borderWidth: 1,
    borderColor: Border,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GreenAccent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GreenAccent,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  newTicketText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Tickets tab
  ticketsContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  createTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GreenAccent,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  createTicketText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ticketsList: {
    gap: 10,
  },
  emptyTickets: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: TextGray,
  },
  emptySubtext: {
    fontSize: 12,
    color: TextMutedLight,
    marginTop: 4,
    textAlign: 'center',
  },
});
