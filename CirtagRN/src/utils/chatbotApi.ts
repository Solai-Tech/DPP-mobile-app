import { ScannedProduct } from '../types/ScannedProduct';

const OPENAI_API_KEY = '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';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

function buildProductContext(products: ScannedProduct[]): string {
  if (products.length === 0) return 'No products have been scanned yet.';

  return products
    .map((p, i) => {
      const name = p.productName || p.displayValue || 'Unknown';
      const lines = [`Product ${i + 1}: ${name}`];
      lines.push(`  URL: ${p.rawValue}`);
      if (p.supplier) lines.push(`  Supplier: ${p.supplier}`);
      if (p.price) lines.push(`  Price: ${p.price}`);
      if (p.weight) lines.push(`  Weight: ${p.weight}`);
      if (p.co2Total) lines.push(`  CO2 Total: ${p.co2Total}`);
      if (p.co2Details) lines.push(`  CO2 Breakdown: ${p.co2Details}`);
      if (p.certifications) lines.push(`  Certifications: ${p.certifications}`);
      if (p.productDescription) lines.push(`  Description: ${p.productDescription}`);
      if (p.productId) lines.push(`  Product ID: ${p.productId}`);
      if (p.skuId) lines.push(`  SKU: ${p.skuId}`);
      return lines.join('\n');
    })
    .join('\n\n');
}

export async function getChatbotReply(
  userMessage: string,
  products: ScannedProduct[]
): Promise<string> {
  const productContext = buildProductContext(products);

  const systemPrompt = `You are CirTag Support Assistant — a smart chatbot for the CirTag sustainability app that tracks Digital Product Passports (DPP).

The user has scanned ${products.length} product(s):
${productContext}

IMPORTANT RULES:
- The user HAS scanned products. NEVER say "you haven't scanned" or "no products found".
- When user asks a question, identify WHICH product they mean and answer ONLY about that one product. Do NOT list all products.
- If unclear which product, answer about the most recently scanned one.
- Always reply using bullet points (use • symbol). Maximum 6 bullet points. Each bullet is 1 short sentence.
- NEVER use markdown formatting. No **, no ##, no []() — plain text only.
- Use the actual product data provided above (supplier, CO2, price, weight, certifications).
- Give practical, useful tips specific to that product. Example style: "• Always check warranty before attempting repairs."
- No URLs or links in responses.
- Be friendly, concise and professional.`;

  try {
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI API error:', err);
      return 'Sorry, I am unable to respond right now. Please try again later.';
    }

    const data = await response.json();
    return (
      data.choices?.[0]?.message?.content?.trim() ??
      'Sorry, I could not generate a response.'
    );
  } catch (error) {
    console.error('Chatbot API error:', error);
    return 'Sorry, something went wrong. Please check your connection and try again.';
  }
}
