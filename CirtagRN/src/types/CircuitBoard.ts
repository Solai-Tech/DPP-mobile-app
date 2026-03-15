// Circuit Board Analysis Types

export interface CircuitBoardInput {
  image: string;       // base64 encoded image
  weight: number;      // in kg
  width: number;       // in cm
  height: number;      // in cm
}

export interface CircuitBoardAnalysis {
  category: 1 | 2;
  price: number;       // in EUR
  pcf: number;         // Product Carbon Footprint in kg CO2
  description: string;
  components: string[];
  productId?: string;
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
  createdAt: number;
}
