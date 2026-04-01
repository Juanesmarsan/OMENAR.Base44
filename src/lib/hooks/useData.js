/**
 * Custom Hook: useData
 * Hook genérico para cargar, filtrar y gestionar datos
 * Elimina 90% de la duplicación en componentes de lista
 */

import { useEffect, useState, useCallback } from 'react';

export const useData = (
  fetchFn,           // Función que trae los datos
  filterFn,         // Función de filtro (opcional)
  sortFn,           // Función de ordenamiento (opcional)
  dependencies = [] // Dependencies adicionales
) => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      const dataList = Array.isArray(result) ? result : [result];
      
      // Ordenar si se proporciona función
      if (sortFn) {
        dataList.sort(sortFn);
      }
      
      setData(dataList);
      applyFilters(dataList, filters, searchTerm);
    } catch (err) {
      setError(err.message || 'Error cargando datos');
      setData([]);
      setFiltered([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, sortFn, ...dependencies]);

  // Aplicar filtros
  const applyFilters = useCallback((dataList, filterObj, search) => {
    let result = dataList;

    // Filtro por búsqueda
    if (search && filterFn?.search) {
      result = result.filter(item => filterFn.search(item, search));
    }

    // Filtros adicionales
    Object.entries(filterObj).forEach(([key, value]) => {
      if (value && filterFn?.[key]) {
        result = result.filter(item => filterFn[key](item, value));
      }
    });

    setFiltered(result);
  }, [filterFn]);

  // Actualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    applyFilters(data, newFilters, searchTerm);
  }, [data, searchTerm, applyFilters]);

  // Actualizar búsqueda
  const updateSearch = useCallback((term) => {
    setSearchTerm(term);
    applyFilters(data, filters, term);
  }, [data, filters, applyFilters]);

  // Cargar datos al montar
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    filtered,
    isLoading,
    error,
    filters,
    setFilters: updateFilters,
    searchTerm,
    setSearchTerm: updateSearch,
    refetch: loadData,
    total: data.length,
    filteredTotal: filtered.length
  };
};

export default useData;
