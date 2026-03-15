import { CircuitBoardInput, CircuitBoardAnalysis, CircuitBoardDPP } from '../types/CircuitBoard';

// DPP Backend URL
// For local development: http://YOUR_COMPUTER_IP:3001/api
// For production: https://your-server.com/api
const DPP_API_URL = 'http://192.168.1.107:3001/api';  // Update IP to your computer's local IP

// PCF calculation factors (kg CO2 per kg of PCB) - for local display
const PCF_FACTORS = {
  manufacturing: 12.5,
  rawMaterials: 8.0,
  transportation: 0.5,
  endOfLife: 2.0,
};

/**
 * Analyze circuit board - sends to DPP backend server
 * Server handles GPT/LLM analysis, categorization, and pricing
 */
export async function analyzeCircuitBoard(
  imageBase64: string,
  weight: number,
  width: number,
  height: number
): Promise<CircuitBoardAnalysis> {
  try {
    // Send to DPP backend for server-side analysis
    const response = await fetch(`${DPP_API_URL}/analyze-pcb`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
        weight: weight,
        width: width,
        height: height,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('DPP API error:', err);
      throw new Error('Failed to analyze circuit board');
    }

    const result = await response.json();

    // Backend returns: { category, price, pcf, description, components }
    return {
      category: result.category || 1,
      price: result.price || 0,
      pcf: result.pcf || 0,
      description: result.description || 'Circuit board',
      components: result.components || [],
    };
  } catch (error) {
    console.error('Circuit board analysis error:', error);
    throw error;
  }
}

/**
 * Create DPP product from circuit board analysis
 * Sends to DPP backend to create the product
 */
export async function createCircuitBoardDPP(
  input: CircuitBoardInput,
  analysis: CircuitBoardAnalysis
): Promise<CircuitBoardDPP> {
  try {
    // Send to DPP backend to create product
    const response = await fetch(`${DPP_API_URL}/create-pcb-product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: input.image,
        weight: input.weight,
        width: input.width,
        height: input.height,
        category: analysis.category,
        price: analysis.price,
        pcf: analysis.pcf,
        description: analysis.description,
        components: analysis.components,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create DPP product');
    }

    const result = await response.json();

    return {
      id: result.productId || `PCB-${Date.now()}`,
      image: input.image,
      weight: input.weight,
      width: input.width,
      height: input.height,
      category: analysis.category,
      price: analysis.price,
      pcf: analysis.pcf,
      description: analysis.description,
      components: analysis.components,
      createdAt: Date.now(),
    };
  } catch (error) {
    console.error('Failed to create DPP:', error);
    throw error;
  }
}

/**
 * Calculate price based on category and weight
 */
export function calculatePrice(category: 1 | 2, weight: number): number {
  const pricing = CATEGORY_PRICING[category];
  return Math.round((pricing.basePrice + (weight * pricing.perKg)) * 100) / 100;
}

/**
 * Calculate Product Carbon Footprint
 */
export function calculatePCF(weight: number): {
  total: number;
  breakdown: { stage: string; value: number }[];
} {
  const manufacturing = weight * PCF_FACTORS.manufacturing;
  const rawMaterials = weight * PCF_FACTORS.rawMaterials;
  const transportation = weight * PCF_FACTORS.transportation;
  const endOfLife = weight * PCF_FACTORS.endOfLife;

  return {
    total: Math.round((manufacturing + rawMaterials + transportation - endOfLife) * 100) / 100,
    breakdown: [
      { stage: 'Manufacturing', value: Math.round(manufacturing * 100) / 100 },
      { stage: 'Raw Materials', value: Math.round(rawMaterials * 100) / 100 },
      { stage: 'Transportation', value: Math.round(transportation * 100) / 100 },
      { stage: 'End of Life (Credit)', value: -Math.round(endOfLife * 100) / 100 },
    ],
  };
}
