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

  const systemPrompt = `You are CirTag Support Assistant for Digital Product Passports (DPP).

Scanned product data:
${productContext}

ABSOLUTE RULES — VIOLATING ANY RULE IS FORBIDDEN:
1. YOUR RESPONSE MUST BE MAXIMUM 5 BULLET POINTS. NEVER MORE THAN 5 LINES TOTAL.
2. Each bullet starts with • and is ONE short sentence (under 15 words).
3. ONLY use exact data from above. Never invent or guess.
4. If data is missing, say "not available". Never make up values.
5. No markdown (no **, ##, []()). Plain text only. No URLs.
6. No greetings, no intros, no outros. Jump straight to the answer.
7. The user HAS scanned products. Never say "you haven't scanned".
8. If unclear which product, use the most recent one.

EXAMPLE FORMAT:
• Product name is XYZ
• CO2 total is 5.2 kg
• Weight is 200g
• Supplier is ABC Corp
• Certification: ISO 14001`;

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
        max_tokens: 100,
        temperature: 0.3,
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
