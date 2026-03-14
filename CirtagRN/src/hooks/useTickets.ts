import { useState, useEffect, useCallback } from 'react';
import { Ticket, ChatMessage } from '../types/Ticket';
import * as ticketDao from '../database/ticketDao';
import * as dao from '../database/scannedProductDao';
import { getFlowiseChatReply } from '../utils/flowiseApi';

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

  // Load tickets and general chat on mount (don't clear — chat moves to ticket on create)
  useEffect(() => {
    (async () => {
      await refreshTickets();
      await loadChatMessages(null);
    })();
  }, [refreshTickets, loadChatMessages]);

  const sendMessage = useCallback(
    async (message: string, ticketId: number | null = null) => {
      const now = Date.now();
      await ticketDao.insertChatMessage({
        ticketId,
        productId: null,
        message,
        sender: 'user',
        createdAt: now,
      });
      await loadChatMessages(ticketId);

      // Get the most recent product to determine which Flowise server to use
      const products = await dao.getAllProducts();
      const recentProduct = products.length > 0 ? products[products.length - 1] : null;
      const productUrl = recentProduct?.rawValue || '';
      const productName = recentProduct?.productName || '';

      const reply = await getFlowiseChatReply(productUrl, message, undefined, productName);

      await ticketDao.insertChatMessage({
        ticketId,
        productId: null,
        message: reply.text,
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
        // Move only this product's chat messages into this ticket
        await ticketDao.moveGeneralChatToTicket(id, productId);
        setChatMessages([]);
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
