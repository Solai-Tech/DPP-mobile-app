import { useState, useEffect, useCallback } from 'react';
import { Ticket, ChatMessage } from '../types/Ticket';
import * as ticketDao from '../database/ticketDao';
import * as dao from '../database/scannedProductDao';
import { getChatbotReply } from '../utils/chatbotApi';

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

  // Start with a fresh chat every time the hook mounts (screen opens)
  useEffect(() => {
    (async () => {
      await ticketDao.clearGeneralChat();
      await refreshTickets();
      await loadChatMessages(null);
    })();
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
      await loadChatMessages(ticketId);

      // Fetch all scanned products for context
      const products = await dao.getAllProducts();
      const reply = await getChatbotReply(message, products);

      await ticketDao.insertChatMessage({
        ticketId,
        message: reply,
        sender: 'bot',
        createdAt: Date.now(),
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

  const clearChat = useCallback(async () => {
    await ticketDao.clearGeneralChat();
    setChatMessages([]);
  }, []);

  return {
    tickets,
    chatMessages,
    isLoading,
    sendMessage,
    createTicket,
    deleteTicket,
    refreshTickets,
    loadChatMessages,
    clearChat,
  };
}
