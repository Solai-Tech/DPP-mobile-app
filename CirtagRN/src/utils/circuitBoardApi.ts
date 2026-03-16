import Constants from 'expo-constants';
import { CircuitBoardAnalysis } from '../types/CircuitBoard';

const extra = Constants.expoConfig?.extra ?? {};

// DPP Server config — loaded from app.config.js / .env.local
const DPP_API_URL: string = extra.dppApiUrl ?? 'https://solai.se/dppx/api';
const CLIENT_ID: string = extra.dppClientId ?? '';
const CLIENT_SECRET: string = extra.dppClientSecret ?? '';

/**
 * Analyze circuit board and create DPP product in one call.
 * Server handles: GPT Vision analysis, pricing, PCF, and product creation.
 */
export async function analyzeAndCreateCircuitBoard(
  imageBase64: string,
  weight: number,
  width: number,
  height: number
): Promise<CircuitBoardAnalysis> {
  const response = await fetch(`${DPP_API_URL}/v1/pcb/analyze/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-ID': CLIENT_ID,
      'X-Client-Secret': CLIENT_SECRET,
    },
    body: JSON.stringify({
      image: imageBase64,
      weight,
      width,
      height,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('DPP API error:', err);
    throw new Error('Failed to analyze circuit board');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Analysis failed');
  }

  return {
    category: result.category || 1,
    price: result.price || 0,
    pcf: result.pcf || 0,
    pcfBreakdown: result.pcfBreakdown || [],
    description: result.description || 'Circuit board',
    components: result.components || [],
    productId: result.productId,
    productDbId: result.product_db_id,
    productUrl: result.product_url,
  };
}
