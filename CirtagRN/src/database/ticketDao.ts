import { getDatabaseSync } from './database';
import { Ticket, ChatMessage } from '../types/Ticket';

export async function getAllTickets(): Promise<Ticket[]> {
  const db = getDatabaseSync();
  return db.getAllSync<Ticket>('SELECT * FROM tickets ORDER BY updatedAt DESC');
}

export async function getTicketById(id: number): Promise<Ticket | null> {
  const db = getDatabaseSync();
  return db.getFirstSync<Ticket>('SELECT * FROM tickets WHERE id = ?', [id]);
}

export async function insertTicket(
  ticket: Omit<Ticket, 'id'>
): Promise<number> {
  const db = getDatabaseSync();
  const result = db.runSync(
    `INSERT INTO tickets (title, description, status, priority, productId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      ticket.title,
      ticket.description,
      ticket.status,
      ticket.priority,
      ticket.productId,
      ticket.createdAt,
      ticket.updatedAt,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateTicketStatus(
  id: number,
  status: Ticket['status']
): Promise<void> {
  const db = getDatabaseSync();
  db.runSync(
    'UPDATE tickets SET status = ?, updatedAt = ? WHERE id = ?',
    [status, Date.now(), id]
  );
}

export async function deleteTicket(id: number): Promise<void> {
  const db = getDatabaseSync();
  db.runSync('DELETE FROM chat_messages WHERE ticketId = ?', [id]);
  db.runSync('DELETE FROM tickets WHERE id = ?', [id]);
}

export async function getChatMessages(
  ticketId: number | null
): Promise<ChatMessage[]> {
  const db = getDatabaseSync();
  if (ticketId === null) {
    return db.getAllSync<ChatMessage>(
      'SELECT * FROM chat_messages WHERE ticketId IS NULL ORDER BY createdAt ASC'
    );
  }
  return db.getAllSync<ChatMessage>(
    'SELECT * FROM chat_messages WHERE ticketId = ? ORDER BY createdAt ASC',
    [ticketId]
  );
}

export async function getTicketByProductId(productId: number): Promise<Ticket | null> {
  const db = getDatabaseSync();
  return db.getFirstSync<Ticket>('SELECT * FROM tickets WHERE productId = ?', [productId]);
}

export async function clearGeneralChat(): Promise<void> {
  const db = getDatabaseSync();
  db.runSync('DELETE FROM chat_messages WHERE ticketId IS NULL');
}

export async function moveGeneralChatToTicket(ticketId: number, productId?: number | null): Promise<void> {
  const db = getDatabaseSync();
  // Move only this product's "Need Help?" chat into its ticket
  const pendingId = productId ? -productId : -1;
  db.runSync('UPDATE chat_messages SET ticketId = ? WHERE ticketId = ?', [ticketId, pendingId]);
}

export async function insertChatMessage(
  msg: Omit<ChatMessage, 'id'>
): Promise<number> {
  const db = getDatabaseSync();
  const result = db.runSync(
    `INSERT INTO chat_messages (ticketId, productId, message, sender, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    [msg.ticketId, msg.productId ?? null, msg.message, msg.sender, msg.createdAt]
  );
  return result.lastInsertRowId;
}

export async function getChatMessagesByProductId(
  productId: number
): Promise<ChatMessage[]> {
  const db = getDatabaseSync();
  return db.getAllSync<ChatMessage>(
    'SELECT * FROM chat_messages WHERE productId = ? ORDER BY createdAt ASC',
    [productId]
  );
}

export async function insertProductChatMessage(
  msg: { productId: number; message: string; sender: 'user' | 'bot'; createdAt: number }
): Promise<number> {
  const db = getDatabaseSync();
  const result = db.runSync(
    `INSERT INTO chat_messages (ticketId, productId, message, sender, createdAt)
     VALUES (NULL, ?, ?, ?, ?)`,
    [msg.productId, msg.message, msg.sender, msg.createdAt]
  );
  return result.lastInsertRowId;
}
