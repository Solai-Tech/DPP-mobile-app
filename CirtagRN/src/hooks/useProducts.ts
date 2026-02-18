import { useState, useEffect, useCallback } from 'react';
import { ScannedProduct } from '../types/ScannedProduct';
import * as dao from '../database/scannedProductDao';
import { fetchProductData } from '../utils/productDataFetcher';

export function useProducts() {
  const [products, setProducts] = useState<ScannedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshProducts = useCallback(async () => {
    const data = await dao.getAllProducts();
    setProducts(data);
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

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
          const enriched = {
            ...product,
            productName: data.name,
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
