import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '../types/Ticket';
import { getChatMessagesByProductId, insertProductChatMessage } from '../database/ticketDao';
import { getFlowiseChatReply } from '../utils/flowiseApi';
import { saveChatToServer } from '../utils/chatbotApi';

export function useProductChat(productId: number, productUrl: string, productName: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const loadMessages = useCallback(async () => {
    const msgs = await getChatMessagesByProductId(productId);
    setMessages(msgs);
  }, [productId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const sendMessage = useCallback(async (text: string) => {
    const now = Date.now();

    // Save user message to DB
    const userId = await insertProductChatMessage({
      productId,
      message: text,
      sender: 'user',
      createdAt: now,
    });
    const userMsg: ChatMessage = {
      id: userId,
      ticketId: null,
      productId,
      message: text,
      sender: 'user',
      createdAt: now,
    };
    setMessages((prev) => [...prev, userMsg]);

    // Show typing indicator
    setIsTyping(true);

    try {
      const reply = await getFlowiseChatReply(productUrl, text, undefined, productName);

      const botId = await insertProductChatMessage({
        productId,
        message: reply.text,
        sender: 'bot',
        createdAt: Date.now(),
      });
      const botMsg: ChatMessage = {
        id: botId,
        ticketId: null,
        productId,
        message: reply.text,
        sender: 'bot',
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);

      // Save to remote server (fire & forget)
      saveChatToServer(text, reply.text, productName, productUrl);
    } catch (err) {
      console.error('[useProductChat] error:', err);
      const errorText = 'Sorry, something went wrong. Please try again.';
      const errId = await insertProductChatMessage({
        productId,
        message: errorText,
        sender: 'bot',
        createdAt: Date.now(),
      });
      const errMsg: ChatMessage = {
        id: errId,
        ticketId: null,
        productId,
        message: errorText,
        sender: 'bot',
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [productId, productUrl, productName]);

  return { messages, isTyping, sendMessage, loadMessages };
}
