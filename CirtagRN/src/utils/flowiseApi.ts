// Each server has its own Flowise chatflow
const CHATFLOW_MAP: Record<string, string> = {
  'https://solai.se': '9d61481d-0ea9-42c1-8ea6-08b36127fdb9',
  'https://demo.cirtag.eu': 'b3156ec9-acda-427b-9124-282f79fb291d',
};
const DEFAULT_CHATFLOW_ID = 'b3156ec9-acda-427b-9124-282f79fb291d';

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
