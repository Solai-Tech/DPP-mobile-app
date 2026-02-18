export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  productId: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: number;
  ticketId: number | null;
  message: string;
  sender: 'user' | 'bot';
  createdAt: number;
}
