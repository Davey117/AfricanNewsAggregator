// src/components/CategorySidebar.js
import React from 'react';
import { useSearchAndFilter } from '../context/SearchAndFilterContext';

export default function CategorySidebar() {
  const { selectedCategory, setSelectedCategory } = useSearchAndFilter();

  const categories = [
  'All Domains',
  'Higher Education',
  'Policy and Governance',
  'Sports',
  'Institutional Funding'
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
      
      {/* Responsive layout wrapper: Row on mobile (<768px), Column on Desktop */}
      <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-2 scrollbar-none snap-x">
        {categories.map((cat) => {
          const isTargetActive = (cat === 'All Domains' && !selectedCategory) || selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategorySelection(cat)}
              className={`whitespace-nowrap text-left text-xs font-semibold px-3 py-2 rounded-md transition-all duration-150 snap-center ${
                isTargetActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 md:translate-x-1'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </aside>
  );
}