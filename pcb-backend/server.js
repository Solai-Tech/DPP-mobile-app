/**
 * PCB DPP Backend Server
 *
 * Flow:
 * 1. Mobile App sends: Photo + Weight + Size
 * 2. Server analyzes photo with GPT-4 Vision
 * 3. Determines Category (1 or 2)
 * 4. Calculates Price based on category
 * 5. Calculates PCF (Product Carbon Footprint)
 * 6. Creates DPP product
 * 7. Returns result to app
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Large limit for base64 images

// OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================
// PRICING CONFIGURATION (Update from your doc)
// ============================================

// Category 1: Simple PCBs (few components, single layer)
// Category 2: Complex PCBs (many components, multi-layer, ICs)
const CATEGORY_PRICING = {
  1: {
    name: 'Simple PCB',
    basePrice: 15.0,      // EUR base price
    pricePerKg: 25.0,     // EUR per kg
    pricePerCm2: 0.05,    // EUR per cm²
  },
  2: {
    name: 'Complex PCB',
    basePrice: 35.0,      // EUR base price
    pricePerKg: 50.0,     // EUR per kg
    pricePerCm2: 0.10,    // EUR per cm²
  },
};

// PCF (Product Carbon Footprint) factors - kg CO2 per kg of PCB
const PCF_FACTORS = {
  manufacturing: 12.5,    // Production emissions
  rawMaterials: 8.0,      // Material extraction & processing
  transportation: 0.5,    // Logistics
  endOfLife: -2.0,        // Recycling credit (negative = benefit)
};

// In-memory storage (replace with database in production)
const products = new Map();

// ============================================
// API ENDPOINTS
// ============================================

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * POST /api/analyze-pcb
 *
 * Analyzes circuit board image using GPT-4 Vision
 * Returns: category, price, pcf, description, components
 */
app.post('/api/analyze-pcb', async (req, res) => {
  try {
    const { image, weight, width, height } = req.body;

    // Validate input
    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }
    if (!weight || weight <= 0) {
      return res.status(400).json({ error: 'Valid weight is required' });
    }
    if (!width || !height || width <= 0 || height <= 0) {
      return res.status(400).json({ error: 'Valid dimensions are required' });
    }

    console.log(`[Analyze PCB] Weight: ${weight}kg, Size: ${width}x${height}cm`);

    // Call GPT-4 Vision to analyze the circuit board
    const analysis = await analyzeWithGPT(image, weight, width, height);

    // Calculate price based on category
    const price = calculatePrice(analysis.category, weight, width, height);

    // Calculate PCF (Product Carbon Footprint)
    const pcf = calculatePCF(weight);

    const result = {
      category: analysis.category,
      price: price,
      pcf: pcf.total,
      pcfBreakdown: pcf.breakdown,
      description: analysis.description,
      components: analysis.components,
    };

    console.log(`[Analyze PCB] Result:`, result);
    res.json(result);

  } catch (error) {
    console.error('[Analyze PCB] Error:', error);
    res.status(500).json({ error: 'Analysis failed', message: error.message });
  }
});

/**
 * POST /api/create-pcb-product
 *
 * Creates a DPP product from analyzed data
 * Returns: productId, success
 */
app.post('/api/create-pcb-product', async (req, res) => {
  try {
    const {
      image,
      weight,
      width,
      height,
      category,
      price,
      pcf,
      description,
      components,
    } = req.body;

    // Generate unique product ID
    const productId = `PCB-${Date.now()}-${uuidv4().slice(0, 8)}`;

    // Create product object
    const product = {
      id: productId,
      type: 'circuit_board',
      image: image ? `data:image/jpeg;base64,${image.slice(0, 100)}...` : null, // Store reference, not full image
      specifications: {
        weight: weight,
        width: width,
        height: height,
        area: width * height,
      },
      analysis: {
        category: category,
        categoryName: CATEGORY_PRICING[category]?.name || 'Unknown',
        components: components || [],
        description: description || '',
      },
      pricing: {
        price: price,
        currency: 'EUR',
      },
      sustainability: {
        pcf: pcf,
        unit: 'kg CO2',
      },
      createdAt: new Date().toISOString(),
    };

    // Store product (in-memory for now)
    products.set(productId, product);

    console.log(`[Create Product] Created: ${productId}`);

    res.json({
      success: true,
      productId: productId,
      product: product,
    });

  } catch (error) {
    console.error('[Create Product] Error:', error);
    res.status(500).json({ error: 'Failed to create product', message: error.message });
  }
});

/**
 * GET /api/products/:id
 *
 * Get product by ID
 */
app.get('/api/products/:id', (req, res) => {
  const product = products.get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

/**
 * GET /api/products
 *
 * List all products
 */
app.get('/api/products', (req, res) => {
  const allProducts = Array.from(products.values());
  res.json({
    count: allProducts.length,
    products: allProducts,
  });
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Analyze circuit board with GPT-4 Vision
 */
async function analyzeWithGPT(imageBase64, weight, width, height) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert circuit board analyzer for Digital Product Passports (DPP).

Analyze the circuit board image and determine:
1. Category:
   - Category 1: Simple PCB (single/double layer, few components, basic resistors/capacitors, no complex ICs)
   - Category 2: Complex PCB (multi-layer, many components, SMD components, microcontrollers, complex ICs)

2. List visible components (capacitors, resistors, ICs, connectors, LEDs, etc.)

3. Brief technical description of the board

Respond ONLY in this exact JSON format:
{
  "category": 1 or 2,
  "components": ["component1", "component2", ...],
  "description": "Brief technical description"
}`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this circuit board for DPP classification.
Specifications:
- Weight: ${weight} kg
- Dimensions: ${width} cm x ${height} cm
- Area: ${(width * height).toFixed(2)} cm²

Determine the category and identify components.`
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
              detail: 'high'
            }
          }
        ]
      }
    ],
    max_tokens: 800,
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content || '';

  // Parse JSON response
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    return {
      category: parsed.category === 2 ? 2 : 1,
      components: parsed.components || [],
      description: parsed.description || 'Circuit board',
    };
  } catch (e) {
    console.error('Failed to parse GPT response:', content);
    // Default fallback based on weight/size heuristics
    const isComplex = weight > 0.3 || (width * height) > 100;
    return {
      category: isComplex ? 2 : 1,
      components: ['Unknown components'],
      description: 'Circuit board (analysis fallback)',
    };
  }
}

/**
 * Calculate price based on category and specifications
 */
function calculatePrice(category, weight, width, height) {
  const pricing = CATEGORY_PRICING[category] || CATEGORY_PRICING[1];
  const area = width * height;

  const price =
    pricing.basePrice +
    (weight * pricing.pricePerKg) +
    (area * pricing.pricePerCm2);

  return Math.round(price * 100) / 100;
}

/**
 * Calculate Product Carbon Footprint (PCF)
 */
function calculatePCF(weight) {
  const manufacturing = weight * PCF_FACTORS.manufacturing;
  const rawMaterials = weight * PCF_FACTORS.rawMaterials;
  const transportation = weight * PCF_FACTORS.transportation;
  const endOfLife = weight * PCF_FACTORS.endOfLife;

  const total = manufacturing + rawMaterials + transportation + endOfLife;

  return {
    total: Math.round(total * 100) / 100,
    breakdown: [
      { stage: 'Manufacturing', value: Math.round(manufacturing * 100) / 100 },
      { stage: 'Raw Materials', value: Math.round(rawMaterials * 100) / 100 },
      { stage: 'Transportation', value: Math.round(transportation * 100) / 100 },
      { stage: 'End of Life (Recycling)', value: Math.round(endOfLife * 100) / 100 },
    ],
  };
}

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║        PCB DPP Backend Server Started             ║
╠═══════════════════════════════════════════════════╣
║  Port: ${PORT}                                        ║
║  URL:  http://localhost:${PORT}                       ║
╠═══════════════════════════════════════════════════╣
║  Endpoints:                                       ║
║  POST /api/analyze-pcb     - Analyze circuit      ║
║  POST /api/create-pcb-product - Create DPP        ║
║  GET  /api/products/:id    - Get product          ║
║  GET  /api/products        - List products        ║
║  GET  /api/health          - Health check         ║
╚═══════════════════════════════════════════════════╝
  `);
});

module.exports = app;
