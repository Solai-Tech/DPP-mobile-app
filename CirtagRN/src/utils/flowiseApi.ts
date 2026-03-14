import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

// Each server has its own Flowise chatflow — IDs loaded from app config
const CHATFLOW_MAP: Record<string, string> = extra.flowiseChatflowMap ?? {};
const DEFAULT_CHATFLOW_ID = extra.flowiseDefaultChatflowId ?? '';

export interface FlowiseReply {
  text: string;
  chatId?: string;
  chatMessageId?: string;
}

export async function getFlowiseChatReply(
  productUrl: string,
  question: string,
  sessionId?: string,
  productName?: string
): Promise<FlowiseReply> {
  let apiHost: string;
  try {
    apiHost = new URL(productUrl).origin;
  } catch {
    apiHost = 'https://demo.cirtag.eu';
  }

  const chatflowId = CHATFLOW_MAP[apiHost] || DEFAULT_CHATFLOW_ID;
  const endpoint = `${apiHost}/api/v1/prediction/${chatflowId}`;

  const body: Record<string, any> = { question };
  if (sessionId) body.sessionId = sessionId;
  if (productName) {
    body.overrideConfig = { productName };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('[Flowise API] error:', err);
    throw new Error(`Flowise API error: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';

  // Handle SSE (text/event-stream) responses
  if (contentType.includes('text/event-stream')) {
    const raw = await response.text();
    let text = '';
    let chatId = '';
    let chatMessageId = '';

    for (const line of raw.split('\n')) {
      if (!line.startsWith('data:')) continue;
      try {
        const payload = JSON.parse(line.slice(5));
        if (payload.event === 'token' && payload.data) text += payload.data;
        if (payload.event === 'metadata' && payload.data) {
          chatId = payload.data.chatId || '';
          chatMessageId = payload.data.chatMessageId || '';
        }
      } catch {}
    }
    return { text: text || 'Sorry, I could not generate a response.', chatId, chatMessageId };
  }

  // Handle JSON responses
  const data = await response.json();
  return {
    text: data.text || data.answer || 'Sorry, I could not generate a response.',
    chatId: data.chatId,
    chatMessageId: data.chatMessageId,
  };
}
