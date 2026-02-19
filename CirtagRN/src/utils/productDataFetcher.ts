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

function cleanName(value: string): string {
  if (!value) return '';
  let name = value
    .replace(/\s+/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s*[-|–]\s*(DPP|Digital Product Passport|SolAI|CirTag).*$/i, '')
    .replace(/^(DPP|Digital Product Passport)\s*[-|–]\s*/i, '')
    .trim();
  name = name.replace(/^[\"'`]+|[\"'`,.;:]+$/g, '').trim();
  if (/^(productname|product name|product)$/i.test(name)) return '';
  return name;
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
    console.log('[CirTag] Fetching product data from:', urlString);
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
    const result = parseHtml(html, baseUrl);
    console.log('[CirTag] Parsed product name:', result.name || '(empty)');
    console.log('[CirTag] Parsed image:', result.imageUrl || '(empty)');
    return result;
  } catch (e) {
    console.log('[CirTag] Fetch error:', e);
    return emptyProductData();
  }
}

function parseHtml(html: string, baseUrl: string): ProductData {
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

  // ── PRODUCT NAME ──
  // 1. Try embedded JSON in <script> tags (most reliable for JS-rendered pages)
  const scriptBlocks = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const block of scriptBlocks) {
    const inner = block.replace(/<\/?script[^>]*>/gi, '');
    // Look for product name in JSON data
    const jsonNamePatterns = [
      /"product_name"\s*:\s*"([^"]+)"/i,
      /"productName"\s*:\s*"([^"]+)"/i,
      /"product_title"\s*:\s*"([^"]+)"/i,
      /"title"\s*:\s*"([^"]{3,80})"/i,
      /"name"\s*:\s*"([^"]{3,80})"/i,
    ];
    for (const pattern of jsonNamePatterns) {
      const match = inner.match(pattern);
      if (match) {
        const val = cleanName(match[1]);
        if (val.length > 2 && !/^(home|login|sign|register|null|undefined|true|false)/i.test(val)) {
          name = val;
          break;
        }
      }
    }
    if (name) break;
  }

  // 2. Try HTML patterns if script didn't find it
  if (!name) {
    const htmlNamePatterns = [
      // Table: <td>Product Name</td><td>Value</td>
      /Product\s*Name\s*<\/t[dh]>\s*<t[dh][^>]*>\s*([^<]+)/is,
      // Label-value
      /Product\s*Name\s*:?\s*<\/[^>]+>\s*<[^>]+>\s*([^<]+)/is,
      /Product\s*Name\s*:\s*([^<\n]+)/i,
      // dt/dd
      /Product\s*Name\s*<\/dt>\s*<dd[^>]*>\s*([^<]+)/is,
      // h1
      /<h1[^>]*>(.*?)<\/h1>/is,
      // JSON-LD
      /"name"\s*:\s*"([^"]+)"/i,
      // og:title
      /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i,
      // meta description (may contain product name)
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
      // h2
      /<h2[^>]*>(.*?)<\/h2>/is,
      // title
      /<title[^>]*>(.*?)<\/title>/is,
    ];
    for (const pattern of htmlNamePatterns) {
      const match = html.match(pattern);
      if (match) {
        let extracted = cleanName(match[1]);
        if (
          extracted.length > 2 &&
          extracted.length < 200 &&
          !/^(home|login|sign|register|404|error|page|digital product passport)/i.test(extracted)
        ) {
          name = extracted;
          break;
        }
      }
    }
  }

  // 3. Try page title as last resort, clean it up
  if (!name) {
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
    if (titleMatch) {
      let title = cleanName(titleMatch[1]);
      if (title.length > 2 && title.length < 200) {
        name = title;
      }
    }
  }

  // ── PRODUCT IMAGE ──
  const imgMatch = html.match(/product_images\/([^'"&\s<>]+)/i);
  if (imgMatch) {
    imageUrl = `${baseUrl}/dpp/media/product_images/${imgMatch[1]}`;
  }

  // Also try og:image
  if (!imageUrl) {
    const ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (ogImg) {
      imageUrl = ogImg[1].startsWith('http') ? ogImg[1] : `${baseUrl}${ogImg[1]}`;
    }
  }

  // ── PRODUCT ID ──
  const idMatch =
    html.match(/Product ID[:\s]*<\/?\w*>?\s*(\d+)/i) ||
    html.match(/product_id['"]\s*:\s*['"]?(\d+)/i) ||
    html.match(/"productId"\s*:\s*['"]?(\d+)/i);
  if (idMatch) productId = idMatch[1].trim();

  // ── DESCRIPTION ──
  const descMatch = html.match(
    /Product Description.*?<(?:p|div|textarea)[^>]*>(.*?)<\/(?:p|div|textarea)>/is
  );
  if (descMatch) {
    description = descMatch[1].replace(/<[^>]+>/g, '').trim();
  }
  // Also try meta description
  if (!description) {
    const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (metaDesc) description = metaDesc[1].trim();
  }
  // Also try JSON
  if (!description) {
    const jsonDesc = html.match(/"(?:product_)?description"\s*:\s*"([^"]{10,300})"/i);
    if (jsonDesc) description = jsonDesc[1].trim();
  }

  // ── PRICE ──
  const priceMatch = html.match(
    /Price[:\s]*<\/?\w*>?\s*([\d.,]+\s*\w{2,5})/i
  );
  if (priceMatch) price = priceMatch[1].trim();

  // ── SUPPLIER ──
  const supplierMatch = html.match(
    /Supplier(?:\s*Name)?[:\s]*<\/?\w*>?\s*([A-Za-z0-9\s&.,'-]+?)(?:<|$)/i
  );
  if (supplierMatch) supplier = supplierMatch[1].trim();
  // Also try JSON
  if (!supplier) {
    const jsonSup = html.match(/"supplier(?:_name)?"\s*:\s*"([^"]+)"/i);
    if (jsonSup) supplier = jsonSup[1].trim();
  }

  // ── SKU ──
  const skuMatch = html.match(
    /SKU ID[:\s]*<\/?\w*>?\s*([A-Za-z0-9\-]+)/i
  );
  if (skuMatch) skuId = skuMatch[1].trim();

  // ── WEIGHT ──
  const weightMatch = html.match(
    /Weight[:\s]*<\/?\w*>?\s*([\d.,]+\s*\w{1,5})/i
  );
  if (weightMatch) weight = weightMatch[1].trim();

  // ── TOTAL CO2 ──
  const co2TotalMatch = html.match(/([\d.,]+)\s*(?:Kg|kg)\s*CO/i);
  if (co2TotalMatch) co2Total = `${co2TotalMatch[1]} Kg CO\u2082 Eqv`;

  // ── CO2 BREAKDOWN ──
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

  // ── CERTIFICATIONS ──
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
  if (html.toLowerCase().includes('verified product')) {
    certs.unshift('Verified Product');
  }

  // ── DATASHEET PDF ──
  const pdfMatch = html.match(/href=["']([^"']*\.pdf[^"']*)["']/i);
  if (pdfMatch) {
    const pdf = pdfMatch[1];
    datasheetUrl = pdf.startsWith('http') ? pdf : `${baseUrl}${pdf}`;
  }

  // ── EXTRACT NAME FROM IMAGE URL AS FALLBACK ──
  if (!name && imageUrl) {
    try {
      const imgParts = imageUrl.split('/');
      const filename = imgParts[imgParts.length - 1];
      const cleanImgName = filename
        .replace(/\.\w+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
      if (cleanImgName.length > 2 && !/^\d+$/.test(cleanImgName)) {
        name = cleanImgName;
      }
    } catch {
      // ignore
    }
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
