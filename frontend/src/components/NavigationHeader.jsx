// src/components/NavigationHeader.js
import React from 'react';
import { useSearchAndFilter } from '../context/SearchAndFilterContext';

export default function NavigationHeader() {
  const { searchQuery, setSearchQuery, selectedCountry, setSelectedCountry } = useSearchAndFilter();

  return (
    <header className="w-full bg-slate-900 text-white shadow-md sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
        
        {/* Academic Platform Identity */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-start">
          <h1 className="text-xl font-bold tracking-tight text-emerald-400 text-center sm:text-left w-full sm:w-auto">
            African NEWS Aggregator
          </h1>
        </div>

        {/* Global Structural Search Input Matrix */}
        <div className="w-full sm:max-w-md relative">
          <input
            type="text"
            className="w-full bg-slate-800 text-slate-100 placeholder-slate-400 text-sm rounded-lg border border-slate-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
            placeholder="Search for articles, keywords, or policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs font-semibold"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Geographic Origin Selector */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end text-xs">
          <span className="text-slate-400 uppercase tracking-wider font-medium">Region:</span>
          <select
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500 outline-none"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            <option value="NG">Nigeria (NG)</option>
            <option value="GH">Ghana (GH)</option>
            <option value="KE">Kenya (KE)</option>
          </select>
        </div>

      </div>
    </header>
  );
}