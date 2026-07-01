// src/components/CategorySidebar.js
import React, { useEffect, useState } from 'react';
import { useSearchAndFilter } from '../context/SearchAndFilterContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;
const FALLBACK_CATEGORIES = [
  { name: 'Higher Education', slug: 'higher-education' },
  { name: 'Policy and Governance', slug: 'policy-and-governance' },
  { name: 'Institutional Funding', slug: 'institutional-funding' },
  { name: 'Research and Innovation', slug: 'research-and-innovation' }
];

export default function CategorySidebar() {
  const { selectedCategory, setSelectedCategory } = useSearchAndFilter();
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/categories`);
        if (!response.ok) {
          throw new Error(`Category fetch failed with ${response.status}`);
        }
        const payload = await response.json();
        if (payload.status === 'success' && Array.isArray(payload.data.categories)) {
          setCategories(payload.data.categories);
          setFetchError(null);
        } else {
          throw new Error('Unexpected categories response format.');
        }
      } catch (error) {
        console.error('[CATEGORY SIDEBAR] Could not load taxonomy:', error.message);
        setFetchError('Unable to load taxonomy. Showing core categories.');
      }
    };

    loadCategories();
  }, []);

  const renderedCategories = [
    { name: 'All Domains', slug: 'all-domains' },
    ...categories
  ];

  const handleCategorySelection = (category) => {
    if (category === 'All Domains') {
      setSelectedCategory('');
    } else {
      setSelectedCategory(category);
    }
  };

  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 shrink-0">
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 hidden md:block">
        Domain Classification
      </h2>
      {fetchError ? (
        <p className="text-[10px] mb-3 text-rose-500 uppercase tracking-[0.18em]">
          {fetchError}
        </p>
      ) : null}
      <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-2 scrollbar-none snap-x">
        {renderedCategories.map((cat) => {
          const isTargetActive = (cat.name === 'All Domains' && !selectedCategory) || selectedCategory === cat.name;
          return (
            <button
              key={cat.slug}
              onClick={() => handleCategorySelection(cat.name)}
              className={`whitespace-nowrap text-left text-xs font-semibold px-3 py-2 rounded-md transition-all duration-150 snap-center ${
                isTargetActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 md:translate-x-1'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </aside>
  );
}