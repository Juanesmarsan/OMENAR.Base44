/**
 * Custom Hook: useAPI
 * Simplifica llamadas a API con manejo de carga, error y caching
 */

import { useState, useCallback, useRef } from 'react';

const apiCache = {};

export const useAPI = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const cacheKey = useRef(url);

  const fetchAPI = useCallback(async (fetchOptions = {}) => {
    // Usar caché si está disponible
    if (apiCache[cacheKey.current] && !fetchOptions.skipCache) {
      setData(apiCache[cacheKey.current]);
      return apiCache[cacheKey.current];
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options,
        ...fetchOptions
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Guardar en caché
      if (!fetchOptions.noCache) {
        apiCache[cacheKey.current] = result;
      }

      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Error en llamada API';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [url, options]);

  const clearCache = useCallback(() => {
    delete apiCache[cacheKey.current];
  }, []);

  const mutate = useCallback(async (newData) => {
    setData(newData);
    apiCache[cacheKey.current] = newData;
  }, []);

  return {
    data,
    error,
    isLoading,
    refetch: () => fetchAPI({ skipCache: true }),
    fetchAPI,
    clearCache,
    mutate
  };
};

export default useAPI;
