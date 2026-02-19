export interface ProductData {
  name: string;
  description: string;
  imageUrl: string;
  productId: string;
  price: string;
  supplier: string;
  skuId: string;
  weight: string;
  co2Total: string;
  co2Details: string;
  certifications: string;
  datasheetUrl: string;
}

function emptyProductData(): ProductData {
  return {
    name: '',
    description: '',
    imageUrl: '',
    productId: '',
    price: '',
    supplier: '',
    skuId: '',
    weight: '',
    co2Total: '',
    co2Details: '',
    certifications: '',
    datasheetUrl: '',
  };
}

export async function fetchProductData(urlString: string): Promise<ProductData> {
  try {
    const url = new URL(urlString);
    const baseUrl = `${url.protocol}//${url.host}`;

    const response = await fetch(urlString, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });
    const html = await response.text();
    return parseHtml(html, baseUrl, urlString);
  } catch {
    // If fetch fails, try to extract name from URL path
    return extractNameFromUrl(urlString);
  }
}

function extractNameFromUrl(urlString: string): ProductData {
  const data = emptyProductData();
  try {
    const url = new URL(urlString);

    // Try query parameters first (e.g., ?name=HP-laptop45 or ?product=HP-laptop45)
    const nameParam = url.searchParams.get('name') ||
                      url.searchParams.get('product') ||
                      url.searchParams.get('title') ||
                      url.searchParams.get('id');
    if (nameParam) {
      data.name = decodeURIComponent(nameParam)
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return data;
    }

    // Try URL path
    const pathParts = url.pathname.split('/').filter(p =>
      p && p !== 'dpp' && p !== 'dppx' && p !== 'product' && p !== 'products' && p !== 'item' && p !== 'view'
    );
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      // Skip if it looks like just a number ID
      if (!/^\d+$/.test(lastPart)) {
        data.name = decodeURIComponent(lastPart)
          .replace(/[-_]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        return data;
      }
    }

    // Fallback: use domain + path as a short name
    const shortPath = url.pathname.split('/').filter(Boolean).slice(-1)[0] || '';
    if (shortPath) {
      data.name = `Product ${shortPath}`;
    } else {
      data.name = `Product from ${url.hostname}`;
    }
  } catch {
    // URL parsing failed - use a generic name
    data.name = 'Scanned Product';
  }
  return data;
}

function parseHtml(html: string, baseUrl: string, fullUrl: string): ProductData {
  let name = '';
  let description = '';
  let imageUrl = '';
  let productId = '';
  let price = '';
  let supplier = '';
  let skuId = '';
  let weight = '';
  let co2Total = '';
  const co2Items: string[] = [];
  const certs: string[] = [];
  let datasheetUrl = '';

  // Product name - try multiple patterns
  const namePatterns = [
    /<h1[^>]*class="[^"]*product[^"]*"[^>]*>(.*?)<\/h1>/is,
    /<h1[^>]*>(.*?)<\/h1>/is,
    /<h2[^>]*class="[^"]*product[^"]*"[^>]*>(.*?)<\/h2>/is,
    /"name"\s*:\s*"([^"]+)"/i,
    /"productName"\s*:\s*"([^"]+)"/i,
    /product_name['"]\s*:\s*['"]([^'"]+)/i,
    /<title[^>]*>(.*?)<\/title>/i,
    /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i,
    /<meta[^>]*name="title"[^>]*content="([^"]+)"/i,
    /class="[^"]*product-title[^"]*"[^>]*>(.*?)</is,
    /class="[^"]*product-name[^"]*"[^>]*>(.*?)</is,
    /id="product-name"[^>]*>(.*?)</is,
  ];
  for (const pattern of namePatterns) {
    const match = html.match(pattern);
    if (match) {
      let extracted = match[1].replace(/<[^>]+>/g, '').trim();
      // Clean up common suffixes like " | Site Name" or " - Company"
      extracted = extracted.split(/\s*[\|\-–—]\s*/)[0].trim();
      if (extracted.length > 0 && extracted.length < 200 && !extracted.toLowerCase().includes('404')) {
        name = extracted;
        break;
      }
    }
  }

  // If still no name, try to extract from URL
  if (!name) {
    const extracted = extractNameFromUrl(fullUrl);
    name = extracted.name;
  }

  // Product image
  const imgMatch = html.match(/product_images\/([^'"&\s<>]+)/i);
  if (imgMatch) {
    imageUrl = `${baseUrl}/dpp/media/product_images/${imgMatch[1]}`;
  }

  // Product ID
  const idMatch =
    html.match(/Product ID[:\s]*<\/?\w*>?\s*(\d+)/i) ||
    html.match(/product_id['"]\s*:\s*['"]?(\d+)/i);
  if (idMatch) productId = idMatch[1].trim();

  // Description
  const descMatch = html.match(
    /Product Description.*?<(?:p|div|textarea)[^>]*>(.*?)<\/(?:p|div|textarea)>/is
  );
  if (descMatch) {
    description = descMatch[1].replace(/<[^>]+>/g, '').trim();
  }

  // Price
  const priceMatch = html.match(
    /Price[:\s]*<\/?\w*>?\s*([\d.,]+\s*\w{2,5})/i
  );
  if (priceMatch) price = priceMatch[1].trim();

  // Supplier
  const supplierMatch = html.match(
    /Supplier Name[:\s]*<\/?\w*>?\s*([A-Za-z0-9\s&.,'-]+?)(?:<|$)/i
  );
  if (supplierMatch) supplier = supplierMatch[1].trim();

  // SKU
  const skuMatch = html.match(
    /SKU ID[:\s]*<\/?\w*>?\s*([A-Za-z0-9\-]+)/i
  );
  if (skuMatch) skuId = skuMatch[1].trim();

  // Weight
  const weightMatch = html.match(
    /Weight[:\s]*<\/?\w*>?\s*([\d.,]+\s*\w{1,5})/i
  );
  if (weightMatch) weight = weightMatch[1].trim();

  // Total CO2
  const co2TotalMatch = html.match(/([\d.,]+)\s*(?:Kg|kg)\s*CO/i);
  if (co2TotalMatch) co2Total = `${co2TotalMatch[1]} Kg CO\u2082 Eqv`;

  // CO2 breakdown items
  const co2Patterns: [string, RegExp][] = [
    ['Raw Material', /Raw Material[^<]*?(\d+\.?\d*)\s*(?:Kg|kg)\s*CO/i],
    ['Shipping & Transport', /Shipping[^<]*?(\d+\.?\d*)\s*(?:Kg|kg)\s*CO/i],
    ['Transportation', /Transportation[^<]*?(\d+\.?\d*)\s*(?:Kg|kg)\s*CO/i],
    ['Manufacturing', /Manufacturing[^<]*?(\d+\.?\d*)\s*(?:Kg|kg)\s*CO/i],
    ['Usage (5 years)', /Usage[^<]*?(\d+\.?\d*)\s*(?:Kg|kg)\s*CO/i],
    ['End of Life', /End of Life[^<]*?(\d+\.?\d*)\s*(?:Kg|kg)\s*CO/i],
  ];
  for (const [label, pattern] of co2Patterns) {
    const match = html.match(pattern);
    if (match) {
      co2Items.push(`${label}:${match[1]} Kg CO\u2082`);
    }
  }

  // Certifications
  const certPatterns = [
    'ISO 14001',
    'BPA Free',
    'FCC Approved',
    'Cradle to Cradle',
    'EU Compliant',
  ];
  for (const cert of certPatterns) {
    if (html.toLowerCase().includes(cert.toLowerCase())) {
      certs.push(cert);
    }
  }

  // Verified Product
  if (html.toLowerCase().includes('verified product')) {
    certs.unshift('Verified Product');
  }

  // Datasheet PDF URL
  const pdfMatch = html.match(/href=["']([^"']*\.pdf[^"']*)["']/i);
  if (pdfMatch) {
    const pdf = pdfMatch[1];
    datasheetUrl = pdf.startsWith('http') ? pdf : `${baseUrl}${pdf}`;
  }

  return {
    name,
    description,
    imageUrl,
    productId,
    price,
    supplier,
    skuId,
    weight,
    co2Total,
    co2Details: co2Items.join(','),
    certifications: certs.join(','),
    datasheetUrl,
  };
}
