/**
 * E-Waste DPP Backend Server
 *
 * Flow:
 * 1. Mobile App sends: Photo + Weight
 * 2. Server analyzes photo with GPT-4 Vision
 * 3. Identifies material from materials database (60+ items)
 * 4. Gets price per kg from database
 * 5. Calculates total price (weight × pricePerKg)
 * 6. Returns result to app
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

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
// LOAD MATERIALS DATABASE
// ============================================

let materialsDB = { materials: [] };

try {
  const materialsPath = path.join(__dirname, 'materials.json');
  const materialsData = fs.readFileSync(materialsPath, 'utf8');
  materialsDB = JSON.parse(materialsData);
  console.log(`[Materials] Loaded ${materialsDB.materials.length} materials from database`);
} catch (error) {
  console.error('[Materials] Error loading materials.json:', error.message);
}

// Create materials list for GPT prompt
function getMaterialsListForPrompt() {
  return materialsDB.materials.map((m, idx) =>
    `${idx + 1}. "${m.name}" - ${m.pricePerKg} kr/kg`
  ).join('\n');
}

// Find material by name (fuzzy match)
function findMaterial(identifiedName) {
  if (!identifiedName) return null;

  const searchName = identifiedName.toLowerCase().trim();

  // Exact match first
  let found = materialsDB.materials.find(m =>
    m.name.toLowerCase() === searchName
  );

  if (found) return found;

  // Partial match
  found = materialsDB.materials.find(m =>
    m.name.toLowerCase().includes(searchName) ||
    searchName.includes(m.name.toLowerCase())
  );

  if (found) return found;

  // Word-based match
  const searchWords = searchName.split(/\s+/);
  found = materialsDB.materials.find(m => {
    const matWords = m.name.toLowerCase();
    return searchWords.filter(w => w.length > 3).every(w => matWords.includes(w));
  });

  return found || null;
}

// PCF (Product Carbon Footprint) factors - kg CO2 per kg
const PCF_FACTORS = {
  manufacturing: 12.5,
  rawMaterials: 8.0,
  transportation: 0.5,
  endOfLife: -2.0,
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
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    materialsLoaded: materialsDB.materials.length
  });
});

/**
 * GET /api/materials
 *
 * Get all materials list
 */
app.get('/api/materials', (req, res) => {
  res.json({
    count: materialsDB.materials.length,
    currency: materialsDB.currency,
    unit: materialsDB.unit,
    materials: materialsDB.materials
  });
});

/**
 * GET /api/materials/search
 *
 * Search materials by name
 */
app.get('/api/materials/search', (req, res) => {
  const query = (req.query.q || '').toLowerCase();

  if (!query) {
    return res.json({ materials: materialsDB.materials });
  }

  const filtered = materialsDB.materials.filter(m =>
    m.name.toLowerCase().includes(query) ||
    m.description.toLowerCase().includes(query) ||
    m.category.toLowerCase().includes(query)
  );

  res.json({
    query,
    count: filtered.length,
    materials: filtered
  });
});

/**
 * POST /api/analyze-pcb
 *
 * Analyzes e-waste image using GPT-4 Vision
 * Identifies material from 60+ items database
 * Returns: material, pricePerKg, totalPrice, description
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

    console.log(`[Analyze E-Waste] Weight: ${weight}kg, Size: ${width || 'N/A'}x${height || 'N/A'}cm`);

    // Call GPT-4 Vision to identify the e-waste material
    const analysis = await analyzeWithGPT(image, weight);

    // Find material in database
    const material = findMaterial(analysis.identifiedMaterial);

    let pricePerKg = 0;
    let materialName = analysis.identifiedMaterial;
    let category = 'unknown';

    if (material) {
      pricePerKg = material.pricePerKg;
      materialName = material.name;
      category = material.category;
      console.log(`[Match] Found: "${material.name}" @ ${pricePerKg} kr/kg`);
    } else {
      console.log(`[Match] No exact match for: "${analysis.identifiedMaterial}"`);
      // Use GPT's suggested price if available, or default
      pricePerKg = analysis.suggestedPrice || 5;
    }

    // Calculate total price
    const totalPrice = Math.round(weight * pricePerKg * 100) / 100;

    // Calculate PCF (Product Carbon Footprint)
    const pcf = calculatePCF(weight);

    const result = {
      // Material identification
      material: materialName,
      materialId: material?.id || null,
      category: category,
      matched: !!material,

      // Pricing
      pricePerKg: pricePerKg,
      currency: 'kr',
      weight: weight,
      price: totalPrice,

      // Legacy fields for app compatibility
      pcf: pcf.total,
      pcfBreakdown: pcf.breakdown,
      description: analysis.description,
      components: analysis.components || [],

      // Confidence
      confidence: analysis.confidence || 0.8,
    };

    console.log(`[Analyze E-Waste] Result:`, {
      material: result.material,
      pricePerKg: result.pricePerKg,
      weight: result.weight,
      totalPrice: result.price
    });

    res.json(result);

  } catch (error) {
    console.error('[Analyze E-Waste] Error:', error);
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
      material,
      category,
      pricePerKg,
      price,
      pcf,
      description,
      components,
    } = req.body;

    // Generate unique product ID
    const productId = `EWASTE-${Date.now()}-${uuidv4().slice(0, 8)}`;

    // Create product object
    const product = {
      id: productId,
      type: 'e-waste',
      material: material || 'Unknown',
      image: image ? `data:image/jpeg;base64,${image.slice(0, 100)}...` : null,
      specifications: {
        weight: weight,
        width: width || null,
        height: height || null,
        area: (width && height) ? width * height : null,
      },
      pricing: {
        pricePerKg: pricePerKg || 0,
        totalPrice: price || 0,
        currency: 'kr',
      },
      analysis: {
        category: category || 'unknown',
        components: components || [],
        description: description || '',
      },
      sustainability: {
        pcf: pcf || 0,
        unit: 'kg CO2',
      },
      createdAt: new Date().toISOString(),
    };

    // Store product (in-memory for now)
    products.set(productId, product);

    console.log(`[Create Product] Created: ${productId} - ${material}`);

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
 * Analyze e-waste with GPT-4 Vision
 */
async function analyzeWithGPT(imageBase64, weight) {
  const materialsList = getMaterialsListForPrompt();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert e-waste material identifier for a recycling company.

Your task is to identify the e-waste item in the image and match it to ONE item from this materials price list:

${materialsList}

IMPORTANT:
- Identify the EXACT material from the list above
- Return the EXACT name as written in the list
- If unsure between multiple matches, pick the most specific one
- If the item doesn't match any material, describe what it is

Respond ONLY in this exact JSON format:
{
  "identifiedMaterial": "EXACT name from list above",
  "confidence": 0.0 to 1.0,
  "description": "Brief description of what you see",
  "components": ["visible parts/components"],
  "suggestedPrice": only if no match found, suggest price in kr/kg
}`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Identify this e-waste item. Weight: ${weight} kg.

Match it to the materials list and return the exact material name.`
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
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content || '';

  // Parse JSON response
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    return {
      identifiedMaterial: parsed.identifiedMaterial || 'Unknown e-waste',
      confidence: parsed.confidence || 0.5,
      description: parsed.description || 'E-waste item',
      components: parsed.components || [],
      suggestedPrice: parsed.suggestedPrice || null,
    };
  } catch (e) {
    console.error('Failed to parse GPT response:', content);
    return {
      identifiedMaterial: 'Unknown e-waste',
      confidence: 0.3,
      description: 'Could not identify the item',
      components: [],
      suggestedPrice: 5,
    };
  }
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
║      E-Waste DPP Backend Server Started           ║
╠═══════════════════════════════════════════════════╣
║  Port: ${PORT}                                        ║
║  URL:  http://localhost:${PORT}                       ║
║  Materials: ${materialsDB.materials.length} items loaded                   ║
╠═══════════════════════════════════════════════════╣
║  Endpoints:                                       ║
║  POST /api/analyze-pcb     - Analyze e-waste      ║
║  POST /api/create-pcb-product - Create DPP        ║
║  GET  /api/materials       - List all materials   ║
║  GET  /api/materials/search?q= - Search materials ║
║  GET  /api/products/:id    - Get product          ║
║  GET  /api/products        - List products        ║
║  GET  /api/health          - Health check         ║
╚═══════════════════════════════════════════════════╝
  `);
});

module.exports = app;
