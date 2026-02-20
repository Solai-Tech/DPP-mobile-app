import { BarcodeScanningResult } from 'expo-camera';

export function getBarcodeFormatName(type: string): string {
  const formatMap: Record<string, string> = {
    qr: 'QR Code',
    aztec: 'Aztec',
    codabar: 'Codabar',
    code39: 'Code 39',
    code93: 'Code 93',
    code128: 'Code 128',
    datamatrix: 'Data Matrix',
    ean8: 'EAN-8',
    ean13: 'EAN-13',
    itf14: 'ITF',
    pdf417: 'PDF417',
    upc_a: 'UPC-A',
    upc_e: 'UPC-E',
  };
  return formatMap[type] || type || 'Unknown';
}

export function inferBarcodeType(data: string): string {
  if (/^https?:\/\//i.test(data)) return 'URL';
  if (/^mailto:/i.test(data)) return 'Email';
  if (/^tel:/i.test(data)) return 'Phone';
  if (/^sms:/i.test(data)) return 'SMS';
  if (/^WIFI:/i.test(data)) return 'WiFi';
  if (/^geo:/i.test(data)) return 'Location';
  if (/^BEGIN:VEVENT/i.test(data)) return 'Calendar Event';
  if (/^BEGIN:VCARD/i.test(data)) return 'Contact';
  if (/^\d{10,13}$/.test(data)) return 'Product';
  return 'Text';
}
