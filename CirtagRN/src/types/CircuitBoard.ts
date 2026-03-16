// Circuit Board Analysis Types

export interface CircuitBoardInput {
  image: string;       // base64 encoded image
  weight: number;      // in kg
  width: number;       // in cm
  height: number;      // in cm
}

export interface CircuitBoardAnalysis {
  category: string | number;
  material?: string;       // Material name from database
  pricePerKg?: number;     // Price per kg
  price: number;           // Total price
  weight?: number;         // Weight in kg
  currency?: string;       // Currency (kr, EUR, etc.)
  pcf: number;             // Product Carbon Footprint in kg CO2
  pcfBreakdown?: { stage: string; value: number }[];
  description: string;
  components: string[];
  confidence?: number;     // LLM confidence score
  productId?: string;      // SKU like PCB-1234-abcd
  productDbId?: number;    // DPP database product ID
  productUrl?: string;     // URL to view product in DPP
}

export interface CircuitBoardDPP {
  id: string;
  image: string;
  weight: number;
  width: number;
  height: number;
  category: 1 | 2;
  price: number;
  pcf: number;
  description: string;
  components: string[];
  productUrl?: string;
  productDbId?: number;
  createdAt: number;
}
