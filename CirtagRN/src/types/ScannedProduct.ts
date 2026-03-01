export interface ScannedProduct {
  id: number;
  rawValue: string;
  displayValue: string;
  format: string;
  type: string;
  productName: string;
  productDescription: string;
  imageUrl: string;
  productId: string;
  price: string;
  supplier: string;
  skuId: string;
  weight: string;
  co2Total: string;
  co2Details: string;       // "Raw Materials:3.15 Kg CO₂,Shipping & Transport:3.18 Kg CO₂"
  certifications: string;   // "ISO 14001,BPA Free,FCC Approved"
  datasheetUrl: string;
  documents: string;
  scannedAt: number;
}
