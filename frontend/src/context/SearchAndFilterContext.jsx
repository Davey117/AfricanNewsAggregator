// src/context/SearchAndFilterContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create the context layer
const SearchAndFilterContext = createContext();

/**
 * CONTEXT PROVIDER COMPONENT
 * Centralized dashboard engine coordinating all live content search queries,
 * filtering configurations, and pagination bounds down the tree.
 */
export const SearchAndFilterProvider = ({ children }) => {
  // 1. Structural Filter State Properties
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('NG'); // Default to Nigeria
  
  // 2. Pagination Configuration State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(12); // Clean 12-card responsive layout structure

  // 3. System Reset Interceptor
  // Automatically reset the pagination index back to page 1 whenever filters mutate
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedCountry]);

  // Unified controller payload package
  const contextValue = {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedCountry,
    setSelectedCountry,
    currentPage,
    setCurrentPage,
    limit,
    setLimit
  };

  return (
    <SearchAndFilterContext.Provider value={contextValue}>
      {children}
    </SearchAndFilterContext.Provider>
  );
};

/**
 * CUSTOM CONSUMER HOOK
 * Safely exposes global filter parameters directly into modular frontend components.
 */
export const useSearchAndFilter = () => {
  const context = useContext(SearchAndFilterContext);
  if (!context) {
    throw new Error('useSearchAndFilter must be executed inside a valid SearchAndFilterProvider wrapper.');
  }
  return context;
};