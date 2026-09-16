import { useState, useEffect, useCallback } from "react";
import { getProducts, getStaticProducts } from "../services/productService.js";

/**
 * Custom hook to load products dynamically with immediate fallback to static data.
 * Guarantees zero-flicker initial render while loading live data from backend if available.
 */
export function useProducts() {
  const [products, setProducts] = useState(() => getStaticProducts());
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProducts();
      setProducts(result.products);
      setIsFallback(result.isFallback);
    } catch (err) {
      setError(err?.message || "Failed to load products");
      setProducts(getStaticProducts());
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const result = await getProducts();
        if (mounted) {
          setProducts(result.products);
          setIsFallback(result.isFallback);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || "Failed to load products");
          setProducts(getStaticProducts());
          setIsFallback(true);
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    products,
    loading,
    isFallback,
    error,
    reload: fetchProducts,
  };
}

export default useProducts;
