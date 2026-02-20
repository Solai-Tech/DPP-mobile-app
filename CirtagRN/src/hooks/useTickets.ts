import { useState, useEffect, useCallback } from 'react';
import { Ticket, ChatMessage } from '../types/Ticket';
import * as ticketDao from '../database/ticketDao';

const BOT_REPLIES: Record<string, string> = {
  hello: "Hello! Welcome to CirTag Support. How can I help you today?",
  help: "I can help you with product verification, CO2 tracking, and raising support tickets. What do you need?",
  ticket: "I'll help you create a ticket. Please describe your issue and I'll log it for you.",
  co2: "For CO2 data questions, please scan the product's QR code first. I can then explain the emission breakdown.",
  default: "Thanks for reaching out! A support agent will review your message shortly. Is there anything else I can help with?",
};

function getBotReply(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  for (const [keyword, reply] of Object.entries(BOT_REPLIES)) {
    if (keyword !== 'default' && lower.includes(keyword)) return reply;
  }
  return BOT_REPLIES.default;
}

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshTickets = useCallback(async () => {
    const data = await ticketDao.getAllTickets();
    setTickets(data);
  }, []);

  const loadChatMessages = useCallback(async (ticketId: number | null) => {
    const msgs = await ticketDao.getChatMessages(ticketId);
    setChatMessages(msgs);
  }, []);

  useEffect(() => {
    refreshTickets();
    loadChatMessages(null);
  }, [refreshTickets, loadChatMessages]);

  const sendMessage = useCallback(
    async (message: string, ticketId: number | null = null) => {
      const now = Date.now();
      await ticketDao.insertChatMessage({
        ticketId,
        message,
        sender: 'user',
        createdAt: now,
      });

      // Simulate bot reply
      const reply = getBotReply(message);
      await ticketDao.insertChatMessage({
        ticketId,
        message: reply,
        sender: 'bot',
        createdAt: now + 1000,
      });

      await loadChatMessages(ticketId);
    },
    [loadChatMessages]
  );

  const createTicket = useCallback(
    async (title: string, description: string, productId?: number) => {
      setIsLoading(true);
      try {
        const now = Date.now();
        const id = await ticketDao.insertTicket({
          title,
          description,
          status: 'open',
          priority: 'medium',
          productId: productId ?? null,
          createdAt: now,
          updatedAt: now,
        });
        await refreshTickets();
        return id;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshTickets]
  );

  const deleteTicket = useCallback(
    async (id: number) => {
      await ticketDao.deleteTicket(id);
      await refreshTickets();
    },
    [refreshTickets]
  );

  return {
    tickets,
    chatMessages,
    isLoading,
    sendMessage,
    createTicket,
    deleteTicket,
    refreshTickets,
    loadChatMessages,
  };
}
