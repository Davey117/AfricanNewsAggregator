// src/hooks/useFetchArticles.js
import { useState, useEffect } from 'react';
import { useSearchAndFilter } from '../context/SearchAndFilterContext';
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * CUSTOM FETCH HOOK
 * Coordinates paginated AJAX resource streams from the backend API,
 * monitoring query dependency state shifts to prevent data fragmentation.
 */
export function useFetchArticles() {
  const {
    searchQuery,
    selectedCategory,
    selectedCountry,
    currentPage,
    limit,
  } = useSearchAndFilter();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paginationData, setPaginationData] = useState({
    totalArticles: 0,
    totalPages: 0
  });

  useEffect(() => {
    const fetchArticlesFromApi = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Construct dynamic path parameter sequences mapping local state settings
        let url = `${API_BASE_URL}/api/v1/articles?page=${currentPage}&limit=${limit}&country=${selectedCountry}`;

        if (selectedCategory) {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }

        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }

        // 2. Transmit HTTP request down the localized pipeline channel
        const response = await fetch(url);

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`API Transaction failure: ${response.status} ${response.statusText} - ${text}`);
        }

        let payload;
        try {
          payload = await response.json();
        } catch (parseError) {
          const text = await response.text();
          throw new Error(`Response parse failure: ${parseError.message} - body=${text}`);
        }

        if (payload.status === 'success') {
          setArticles(payload.data.articles || []);
          setPaginationData({
            totalArticles: payload.pagination.totalArticles || 0,
            totalPages: payload.pagination.totalPages || 0
          });
        } else {
          throw new Error(payload.message || 'Malformed server tracking packet format.');
        }
      } catch (err) {
        console.error(`[NETWORK DESK CRASH] ${err.message}`);
        setError(err.message);
        setArticles([]); // Wipe arrays defensively to prevent layout bleed over crashes
      } finally {
        setLoading(false);
      }
    };

    // Use a slight 300ms debounce loop for text search entries to save backend processing power
    const delayDebounceTimer = setTimeout(() => {
      fetchArticlesFromApi();
    }, searchQuery ? 300 : 0);

    return () => clearTimeout(delayDebounceTimer);
  }, [searchQuery, selectedCategory, selectedCountry, currentPage, limit]);

  return { articles, loading, error, paginationData };
}