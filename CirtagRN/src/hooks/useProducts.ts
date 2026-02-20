import { useState, useEffect, useCallback, useRef } from 'react';
import { ScannedProduct } from '../types/ScannedProduct';
import * as dao from '../database/scannedProductDao';
import { fetchProductData } from '../utils/productDataFetcher';
import { fetchTitle } from '../utils/webTitleFetcher';

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
          const data = await fetchProductData(product.rawValue);
          const cleaned = cleanProductName(data.name);
          if (cleaned) {
            await dao.updateProductName(product.id, cleaned);
            anyFixed = true;
            continue;
          }
          // Fallback: fetch page title
          const title = await fetchTitle(product.rawValue);
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
        const isUrl =
          product.rawValue.startsWith('http://') ||
          product.rawValue.startsWith('https://');

        if (isUrl) {
          const data = await fetchProductData(product.rawValue);
          let productName = cleanProductName(data.name);

          // If parser couldn't find name, try page title
          if (!productName) {
            const title = await fetchTitle(product.rawValue);
            if (title) {
              productName = cleanProductName(title);
            }
          }

          const enriched = {
            ...product,
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
