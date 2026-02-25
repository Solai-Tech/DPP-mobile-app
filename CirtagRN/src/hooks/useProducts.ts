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
    const needsFix = products.filter(
      (p) => p.rawValue.startsWith('http') && isDirtyName(p.productName)
    );
    if (needsFix.length === 0) return;
    fixedRef.current = true;

    (async () => {
      let anyFixed = false;
      for (const product of needsFix) {
        try {
          // Try full parser first
          const fetchUrl = fixLocalhostUrl(product.rawValue);
          const data = await fetchProductData(fetchUrl);
          const cleaned = cleanProductName(data.name);
          if (cleaned) {
            await dao.updateProductName(product.id, cleaned);
            anyFixed = true;
            continue;
          }
          // Fallback: fetch page title
          const title = await fetchTitle(fetchUrl);
          if (title) {
            const cleanTitle = cleanProductName(title);
            if (cleanTitle.length > 0) {
              await dao.updateProductName(product.id, cleanTitle);
              anyFixed = true;
            }
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
        // Check if this product was already scanned
        const existing = await dao.getProductByRawValue(product.rawValue);
        if (existing) {
          onComplete(existing.id);
          return;
        }

        const isUrl =
          product.rawValue.startsWith('http://') ||
          product.rawValue.startsWith('https://');

        if (isUrl) {
          // Fix localhost URLs so phone can reach the dev machine
          const fetchUrl = fixLocalhostUrl(product.rawValue);
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
