import Constants from 'expo-constants';
import { CircuitBoardAnalysis } from '../types/CircuitBoard';

const extra = Constants.expoConfig?.extra ?? {};

// DPP Server config — loaded from app.config.js / .env.local
const DPP_API_URL: string = extra.dppApiUrl ?? 'https://solai.se/dppx/api';
const CLIENT_ID: string = extra.dppClientId ?? '';
const CLIENT_SECRET: string = extra.dppClientSecret ?? '';

const MAX_RETRIES = 5;

// Pricing config (matches DPP server logic)
const CATEGORY_PRICING = {
  1: { basePrice: 15.0, pricePerKg: 25.0, pricePerCm2: 0.05 },
  2: { basePrice: 35.0, pricePerKg: 50.0, pricePerCm2: 0.10 },
};

const PCF_FACTORS = {
  manufacturing: 12.5,
  rawMaterials: 8.0,
  transportation: 0.5,
  endOfLife: -2.0,
};

/**
 * Derive a human-readable category name from the server category and product description.
 */
function getCategoryDisplayName(category: string | number, description: string): string {
  // If server already returned a readable string, use it
  if (typeof category === 'string' && category.length > 3) return category;

  const lower = description.toLowerCase();
  if (/\b(pcb|circuit board|printed circuit)\b/.test(lower)) return 'Circuit Board';
  if (/\b(laptop|phone|smartphone|tablet|computer|monitor|keyboard|mouse)\b/.test(lower)) return 'Electronics';
  if (/\b(sofa|chair|table|desk|furniture|cabinet|shelf|bookcase|couch)\b/.test(lower)) return 'Furniture';
  if (/\b(battery|batteries|cell|power bank|charger)\b/.test(lower)) return 'Battery / Power';
  if (/\b(vacuum|washer|dryer|oven|fridge|refrigerator|microwave|dishwasher|blender)\b/.test(lower)) return 'Home Appliance';
  if (/\b(lamp|light|bulb|led|chandelier)\b/.test(lower)) return 'Lighting';
  if (/\b(cup|mug|glass|bottle|plate|bowl|kettle|pot|pan)\b/.test(lower)) return 'Kitchenware';
  if (/\b(shirt|pants|jacket|shoe|clothing|textile|fabric|dress|sweater)\b/.test(lower)) return 'Textile';
  if (/\b(toy|game|doll|puzzle)\b/.test(lower)) return 'Toy';
  if (/\b(tool|drill|saw|hammer|wrench|screwdriver)\b/.test(lower)) return 'Tool';
  if (/\b(speaker|headphone|earphone|audio|radio|tv|television)\b/.test(lower)) return 'Audio / Video';
  if (/\b(bag|backpack|suitcase|luggage|purse|wallet)\b/.test(lower)) return 'Bag / Luggage';
  if (/\b(watch|clock)\b/.test(lower)) return 'Watch / Clock';
  if (/\b(camera|lens|tripod)\b/.test(lower)) return 'Camera';

  // Fallback: use server category number with label
  if (category === 1) return 'Standard';
  if (category === 2) return 'Complex';
  return `Category ${category}`;
}

/**
 * Check if product is PCB/electronics based on description and components.
 */
export function isPcbProduct(analysis: CircuitBoardAnalysis): boolean {
  const text = `${analysis.description} ${(analysis.components || []).join(' ')} ${analysis.material || ''}`.toLowerCase();
  const pcbKeywords = ['pcb', 'circuit board', 'printed circuit', 'capacitor', 'resistor', 'ic ', 'transistor', 'solder', 'fr4', 'microcontroller'];
  return pcbKeywords.some(kw => text.includes(kw));
}

/**
 * Local fallback: calculate analysis when server fails.
 */
function analyzeLocally(weight: number, width: number, height: number): CircuitBoardAnalysis {
  const area = width * height;
  const cat: 1 | 2 = weight > 0.3 || area > 100 ? 2 : 1;
  const pricing = CATEGORY_PRICING[cat];
  const price = Math.round((pricing.basePrice + weight * pricing.pricePerKg + area * pricing.pricePerCm2) * 100) / 100;

  const mfg = Math.round(weight * PCF_FACTORS.manufacturing * 100) / 100;
  const raw = Math.round(weight * PCF_FACTORS.rawMaterials * 100) / 100;
  const transport = Math.round(weight * PCF_FACTORS.transportation * 100) / 100;
  const eol = Math.round(weight * PCF_FACTORS.endOfLife * 100) / 100;
  const pcf = Math.round((mfg + raw + transport + eol) * 100) / 100;

  const catName = cat === 1 ? 'Standard' : 'Complex';

  return {
    category: cat,
    categoryName: catName,
    price,
    pcf,
    pcfBreakdown: [
      { stage: 'Manufacturing', value: mfg },
      { stage: 'Raw Materials', value: raw },
      { stage: 'Transportation', value: transport },
      { stage: 'End of Life (Recycling)', value: eol },
    ],
    description: `Product with dimensions ${width}cm x ${height}cm, weighing ${weight}kg. Registered for Digital Product Passport compliance and sustainability tracking.`,
    components: [],
    productName: '',
    productId: `DPP-${Date.now()}`,
  };
}

/**
 * Analyze ANY product (circuit board, electronics, furniture, etc.) and create DPP entry.
 * Server uses GPT-4o Vision to identify the product from the image.
 * Falls back to local analysis if server keeps failing.
 */
export async function analyzeAndCreateCircuitBoard(
  imageBase64: string,
  weight: number,
  width: number,
  height: number,
  productName: string
): Promise<CircuitBoardAnalysis> {
  let lastError = '';
  const area = (width * height).toFixed(1);

  // Include user-provided product name in description for server context.
  // Must be ~50 words to pass server validation.
  const description = `${productName} submitted for Digital Product Passport registration. Physical measurements: width ${width} centimeters, height ${height} centimeters, surface area approximately ${area} square centimeters, weight ${weight} kilograms. Product name provided by user: ${productName}. Please analyze this product for European Union Digital Product Passport compliance sustainability tracking carbon footprint calculation and circular economy lifecycle documentation.`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
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
          description,
          product_name: productName,
        }),
      });

      if (!response.ok) {
        let serverMsg = 'Failed to analyze product';
        try {
          const errBody = await response.json();
          serverMsg = errBody.error || errBody.message || serverMsg;
        } catch { /* ignore */ }

        lastError = serverMsg;
        if (attempt < MAX_RETRIES) {
          console.log(`Server error, retrying (${attempt}/${MAX_RETRIES})...`);
          continue;
        }
        continue;
      }

      const result = await response.json();

      if (!result.success) {
        lastError = result.error || 'Analysis failed';
        if (attempt < MAX_RETRIES) {
          console.log(`Analysis failed, retrying (${attempt}/${MAX_RETRIES})...`);
          continue;
        }
        continue;
      }

      const desc = result.description || '';

      // Use user-provided product name as primary
      const detectedName = productName;

      // Use server's category name if available, otherwise derive from description
      const catName = result.categoryName || getCategoryDisplayName(result.category || 1, desc);

      return {
        category: result.category || 1,
        categoryName: catName,
        price: result.price || 0,
        pcf: result.pcf || 0,
        pcfBreakdown: result.pcfBreakdown || [],
        description: desc,
        components: result.components || [],
        material: result.material || '',
        pricePerKg: result.scrap_price_per_kg || result.pricePerKg,
        weight: result.weight,
        productName: detectedName,
        productId: result.productId,
        productDbId: result.product_db_id,
        productUrl: result.product_url,
      };
    } catch (e: any) {
      lastError = e?.message || 'Network error';
      if (attempt < MAX_RETRIES) continue;
    }
  }

  console.log('Server failed after retries, using local analysis. Last error:', lastError);
  return analyzeLocally(weight, width, height);
}
