export interface DocumentInfo {
  name: string;
  url: string;
  type: 'pdf' | 'datasheet' | 'certificate' | 'other';
}

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
  documents: string;
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
    documents: '',
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
    html.match(/PRODUCT\s+ID[:\s]*(\d+)/i) ||
    html.match(/Product ID[:\s]*(?:<[^>]*>)*\s*(\d+)/i) ||
    html.match(/product_id['"]\s*:\s*['"]?(\d+)/i);
  if (idMatch) productId = idMatch[1].trim();

  // Description
  const descMatch = html.match(
    /Product Description[\s\S]*?<(?:p|div|textarea)[^>]*>([\s\S]*?)<\/(?:p|div|textarea)>/i
  );
  if (descMatch) {
    description = descMatch[1].replace(/<[^>]+>/g, '').trim();
  }

  // Price - handle tags between label and value
  const priceMatch =
    html.match(/Price[:\s]*(?:<[^>]*>)*\s*([\d.,]+\s*\w{2,5})/i) ||
    html.match(/<h4[^>]*>Price<\/h4>\s*<p[^>]*>([\s\S]*?)<\/p>/i);
  if (priceMatch) {
    const val = priceMatch[1].replace(/<[^>]+>/g, '').trim();
    if (val && val !== 'Not specified') price = val;
  }

  // Supplier - handle both "Supplier Name" and just "Supplier", cross tags
  const supplierMatch =
    html.match(/Supplier Name[:\s]*(?:<[^>]*>)*\s*([A-Za-z0-9\s&.,'-]+?)(?:<|$)/i) ||
    html.match(/<h4[^>]*>Supplier<\/h4>\s*<p[^>]*>([\s\S]*?)<\/p>/i);
  if (supplierMatch) {
    const val = supplierMatch[1].replace(/<[^>]+>/g, '').trim();
    if (val && val !== 'Not specified' && val !== '--') supplier = val;
  }

  // SKU - handle tags
  const skuMatch =
    html.match(/SKU\s*ID[:\s]*(?:<[^>]*>)*\s*([A-Za-z0-9\-]+)/i) ||
    html.match(/<h4[^>]*>SKU<\/h4>\s*<p[^>]*>([\s\S]*?)<\/p>/i);
  if (skuMatch) {
    const val = skuMatch[1].replace(/<[^>]+>/g, '').trim();
    if (val && val !== 'Not specified') skuId = val;
  }

  // Weight - handle multi-tag HTML (e.g. <h4>Weight</h4><p>85 kg</p>)
  const weightMatch =
    html.match(/<h4[^>]*>Weight<\/h4>\s*<p[^>]*>([\s\S]*?)<\/p>/i) ||
    html.match(/Weight[:\s]*(?:<[^>]*>)*\s*([\d.,]+\s*(?:kg|g|lbs?)\b)/i);
  if (weightMatch) {
    let val = weightMatch[1].replace(/<[^>]+>/g, '').trim();
    // Clean up double units like "85 kg Kg"
    val = val.replace(/(\d+\.?\d*\s*kg)\s*kg/i, '$1');
    if (val && val !== 'Not specified' && /\d/.test(val)) weight = val;
  }

  // CO2 breakdown - STRATEGY 1: parse JS PCF variables (e.g. const manufacturingPCF = parseFloat('9.33'))
  const pcfPatterns: [string, RegExp][] = [
    ['Manufacturing', /manufacturingPCF\s*=\s*parseFloat\(['"](\d+\.?\d*)['"]\)/i],
    ['Usage', /usagePCF\s*=\s*parseFloat\(['"](\d+\.?\d*)['"]\)/i],
    ['Transportation', /transportationPCF\s*=\s*parseFloat\(['"](\d+\.?\d*)['"]\)/i],
    ['End of Life', /endOfLifePCF\s*=\s*parseFloat\(['"](\d+\.?\d*)['"]\)/i],
  ];
  for (const [label, pattern] of pcfPatterns) {
    const match = html.match(pattern);
    if (match && parseFloat(match[1]) > 0) {
      co2Items.push(`${label}:${match[1]} Kg CO\u2082`);
    }
  }

  // CO2 breakdown - STRATEGY 2: parse carbon-value divs
  // Format: <div>Manufacturing(kgCO₂)</div>\n<div class="carbon-value">9.33</div>
  if (co2Items.length === 0) {
    const carbonBoxRegex = /(Manufacturing|Usage|Transportation|End of Life|Raw Material)[^<]*\(kg\s*CO/gi;
    let cbMatch;
    while ((cbMatch = carbonBoxRegex.exec(html)) !== null) {
      const after = html.substring(cbMatch.index, cbMatch.index + 500);
      const valMatch = after.match(/carbon-value[^>]*>\s*([\d.,]+)/i);
      if (valMatch && parseFloat(valMatch[1]) > 0) {
        const label = cbMatch[1].trim();
        co2Items.push(`${label}:${valMatch[1]} Kg CO\u2082`);
      }
    }
  }

  // CO2 breakdown - STRATEGY 3: chart.js with category labels array
  if (co2Items.length === 0) {
    const chartMatch = html.match(
      /labels:\s*\[([^\]]+)\][\s\S]*?label:\s*'CO[\s\S]*?data:\s*\[([^\]]+)\]/
    );
    if (chartMatch) {
      const labels = chartMatch[1].match(/'([^']+)'/g)?.map(s => s.replace(/'/g, ''));
      const values = chartMatch[2].split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
      if (labels && labels.length === values.length) {
        for (let i = 0; i < labels.length; i++) {
          co2Items.push(`${labels[i]}:${values[i].toFixed(2)} Kg CO\u2082`);
        }
      }
    }
  }

  // CO2 breakdown - STRATEGY 4: regex patterns across HTML tags (fallback)
  if (co2Items.length === 0) {
    const co2Patterns: [string, RegExp][] = [
      ['Manufacturing', /Manufacturing[\s\S]{0,500}?(\d+\.?\d*)\s*(?:<[^>]*>\s*)?(?:Kg|kg)\s*CO/i],
      ['Usage', /Usage[\s\S]{0,500}?(\d+\.?\d*)\s*(?:<[^>]*>\s*)?(?:Kg|kg)\s*CO/i],
      ['Transportation', /(?:Transportation|Shipping)[^a-zA-Z][\s\S]{0,500}?(\d+\.?\d*)\s*(?:<[^>]*>\s*)?(?:Kg|kg)\s*CO/i],
      ['End of Life', /End of Life[\s\S]{0,500}?(\d+\.?\d*)\s*(?:<[^>]*>\s*)?(?:Kg|kg)\s*CO/i],
      ['Raw Material', /Raw Material[\s\S]{0,500}?(\d+\.?\d*)\s*(?:<[^>]*>\s*)?(?:Kg|kg)\s*CO/i],
    ];
    for (const [label, pattern] of co2Patterns) {
      const match = html.match(pattern);
      if (match) {
        co2Items.push(`${label}:${match[1]} Kg CO\u2082`);
      }
    }
  }

  // Total CO2 - compute from breakdown if available, else parse from HTML
  if (co2Items.length > 0) {
    const sum = co2Items.reduce((acc, item) => {
      const val = parseFloat(item.split(':')[1]) || 0;
      return acc + val;
    }, 0);
    co2Total = `${sum.toFixed(2)} Kg CO\u2082 Eqv`;
  } else {
    const co2TotalMatch =
      html.match(/co2-total[^>]*>([\d.,]+)\s*(?:Kg|kg)\s*CO/i) ||
      html.match(/Total[^<]{0,30}?([\d.,]+)\s*(?:Kg|kg)\s*CO/i);
    if (co2TotalMatch) co2Total = `${co2TotalMatch[1]} Kg CO\u2082 Eqv`;
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

  // Datasheet PDF URL - check .pdf links and /datasheet/ paths
  const pdfMatch =
    html.match(/href=["']([^"']*\.pdf[^"']*)["']/i) ||
    html.match(/href=["']([^"']*\/datasheet\/[^"']*)["']/i);
  if (pdfMatch) {
    const pdf = pdfMatch[1];
    datasheetUrl = pdf.startsWith('http') ? pdf : `${baseUrl}${pdf}`;
  }

  // Document extraction
  const docs: DocumentInfo[] = [];
  const seenUrls = new Set<string>();

  const linkRegex = /<a\s[^>]*href=["']([^"']+)["'][^>]*(?:\sdownload[^>]*)?>([\s\S]*?)<\/a>/gi;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const href = linkMatch[1];
    const linkText = linkMatch[2].replace(/<[^>]+>/g, '').trim();
    const isPdf = /\.pdf(\?|#|$)/i.test(href);
    const isDocPath = /\/(datasheet|document|download|certificate)\//i.test(href);
    const hasDownload = /\sdownload/i.test(linkMatch[0]);

    if (!isPdf && !isDocPath && !hasDownload) continue;

    const resolvedUrl = href.startsWith('http') ? href : `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`;
    if (seenUrls.has(resolvedUrl)) continue;
    seenUrls.add(resolvedUrl);

    let docName = linkText || '';
    if (!docName) {
      const parts = resolvedUrl.split('/');
      docName = decodeURIComponent(parts[parts.length - 1].split('?')[0]).replace(/[-_]/g, ' ');
    }

    let docType: DocumentInfo['type'] = 'other';
    if (isPdf) docType = 'pdf';
    else if (/datasheet/i.test(resolvedUrl)) docType = 'datasheet';
    else if (/certificate/i.test(resolvedUrl)) docType = 'certificate';

    docs.push({ name: docName, url: resolvedUrl, type: docType });
  }

  // Include the primary datasheet if found and not already in the list
  if (datasheetUrl && !seenUrls.has(datasheetUrl)) {
    docs.unshift({ name: 'Product Datasheet', url: datasheetUrl, type: 'datasheet' });
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
    documents: docs.length > 0 ? JSON.stringify(docs) : '',
  };
}
