import { useState, useEffect, useCallback, useRef } from 'react';
import Constants from 'expo-constants';
import { ScannedProduct } from '../types/ScannedProduct';
import * as dao from '../database/scannedProductDao';
import { fetchProductData } from '../utils/productDataFetcher';
import { fetchTitle } from '../utils/webTitleFetcher';

/** Replace localhost with the dev machine's real IP so the phone can reach it */
function fixLocalhostUrl(url: string): string {
  if (!url.includes('localhost') && !url.includes('127.0.0.1')) return url;
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost ?? '';
  const machineIp = hostUri.split(':')[0];
  if (!machineIp) return url;
  return url.replace(/localhost|127\.0\.0\.1/g, machineIp);
}

export function useProducts() {
  const [products, setProducts] = useState<ScannedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fixedRef = useRef(false);

  const refreshProducts = useCallback(async () => {
    const data = await dao.getAllProducts();
    setProducts(data);
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const cleanProductName = (value: string): string => {
    if (!value) return '';
    let name = value
      .replace(/\s+/g, ' ')
      .replace(/\s*[-|–]\s*(DPP|Digital Product Passport|SolAI|CirTag).*$/i, '')
      .replace(/^(DPP|Digital Product Passport)\s*[-|–]\s*/i, '')
      .trim();
    name = name.replace(/^[\"'`]+|[\"'`,.;:]+$/g, '').trim();
    if (/^(productname|product name|product)$/i.test(name)) return '';
    return name;
  };

  const isDirtyName = (value: string): boolean => {
    if (!value) return true;
    const cleaned = cleanProductName(value);
    return !cleaned || cleaned !== value.trim();
  };

  // Auto-fix products with missing/dirty names (run once)
  useEffect(() => {
    if (fixedRef.current || products.length === 0) return;
    const needsNameFix = products.filter(
      (p) => p.rawValue.startsWith('http') && isDirtyName(p.productName)
    );
    // Also fix products with missing/incomplete CO2 details
    const needsCo2Fix = products.filter(
      (p) => p.rawValue.startsWith('http') && (!p.co2Details || p.co2Details.split(',').length < 2)
    );
    const needsDocsFix = products.filter(
      (p) => p.rawValue.startsWith('http') && !p.documents
    );
    if (needsNameFix.length === 0 && needsCo2Fix.length === 0 && needsDocsFix.length === 0) return;
    fixedRef.current = true;

    (async () => {
      let anyFixed = false;
      const allNeedsFix = new Map<number, ScannedProduct>();
      needsNameFix.forEach((p) => allNeedsFix.set(p.id, p));
      needsCo2Fix.forEach((p) => allNeedsFix.set(p.id, p));
      needsDocsFix.forEach((p) => allNeedsFix.set(p.id, p));

      for (const product of allNeedsFix.values()) {
        try {
          const fetchUrl = fixLocalhostUrl(product.rawValue);
          const data = await fetchProductData(fetchUrl);

          // Fix name if needed
          if (isDirtyName(product.productName)) {
            const cleaned = cleanProductName(data.name);
            if (cleaned) {
              await dao.updateProductName(product.id, cleaned);
              anyFixed = true;
            } else {
              const title = await fetchTitle(fetchUrl);
              if (title) {
                const cleanTitle = cleanProductName(title);
                if (cleanTitle.length > 0) {
                  await dao.updateProductName(product.id, cleanTitle);
                  anyFixed = true;
                }
              }
            }
          }

          // Fix CO2 data if needed
          if (data.co2Details && data.co2Details.split(',').length >= 2) {
            await dao.updateProductCO2(product.id, data.co2Total, data.co2Details);
            anyFixed = true;
          }

          // Fix documents if needed
          if (!product.documents && data.documents) {
            await dao.updateProductDocuments(product.id, data.documents);
            anyFixed = true;
          }
        } catch {
          // ignore
        }
      }
      if (anyFixed) {
        const updated = await dao.getAllProducts();
        setProducts(updated);
      }
    })();
  }, [products]);

  const scanAndSaveProduct = useCallback(
    async (
      product: Omit<ScannedProduct, 'id'>,
      onComplete: (id: number) => void
    ) => {
      setIsLoading(true);
      try {
        const isUrl =
          product.rawValue.startsWith('http://') ||
          product.rawValue.startsWith('https://');

        // Fix localhost URLs so phone can reach the dev machine
        const fetchUrl = isUrl ? fixLocalhostUrl(product.rawValue) : product.rawValue;

        // Check if this product was already scanned (check both original and fixed URL)
        const existing = await dao.getProductByRawValue(product.rawValue)
          || (fetchUrl !== product.rawValue ? await dao.getProductByRawValue(fetchUrl) : null);
        if (existing) {
          onComplete(existing.id);
          return;
        }

        if (isUrl) {
          const data = await fetchProductData(fetchUrl);
          let productName = cleanProductName(data.name);

          // If parser couldn't find name, try page title
          if (!productName) {
            const title = await fetchTitle(fetchUrl);
            if (title) {
              productName = cleanProductName(title);
            }
          }

          const enriched = {
            ...product,
            rawValue: fetchUrl,
            productName,
            productDescription: data.description,
            imageUrl: data.imageUrl,
            productId: data.productId,
            price: data.price,
            supplier: data.supplier,
            skuId: data.skuId,
            weight: data.weight,
            co2Total: data.co2Total,
            co2Details: data.co2Details,
            certifications: data.certifications,
            datasheetUrl: data.datasheetUrl,
            documents: data.documents,
          };
          const id = await dao.insertProduct(enriched);
          await refreshProducts();
          onComplete(id);
        } else {
          const id = await dao.insertProduct(product);
          await refreshProducts();
          onComplete(id);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [refreshProducts]
  );

  const deleteProduct = useCallback(
    async (id: number) => {
      await dao.deleteProduct(id);
      await refreshProducts();
    },
    [refreshProducts]
  );

  const getProductById = useCallback(async (id: number) => {
    return dao.getProductById(id);
  }, []);

  return { products, isLoading, scanAndSaveProduct, deleteProduct, getProductById, refreshProducts };
}
