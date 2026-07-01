// src/App.js
import React from 'react';
import NavigationHeader from './components/NavigationHeader';
import CategorySidebar from './components/CategorySidebar';
import ArticleCard from './components/ArticleCard';
import { useFetchArticles } from './hooks/useFetchArticles';
import { useSearchAndFilter } from './context/SearchAndFilterContext';
const API_BASE_URL = import.meta.env.VITE_API_URL;

function App() {
  const { articles, loading, error, paginationData } = useFetchArticles();
  const { currentPage, setCurrentPage } = useSearchAndFilter();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* 1. Sticky Application Top Search Control Bar */}
      <NavigationHeader />

      {/* Main Framework Working Desktop Canvas */}
      <div className="max-w-7xl w-full mx-auto flex-grow flex flex-col md:flex-row px-4 py-6 gap-6">
        
        {/* 2. Left Structural Filter Selection Workspace */}
        <CategorySidebar />

        {/* Right Content Presentation Layout Canvas */}
        <main className="flex-grow flex flex-col justify-between">
          
          {/* Dynamic Handling Conditions Block */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-4 font-semibold shadow-sm mb-6">
              ⚠️ Ingestion Retrieval Alert: {error}. Check your backend server state loop logs.
            </div>
          )}

          {loading ? (
            // Skeleton Layout Matrix or Standard Loading Stream State
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-xl h-72 p-4 flex flex-col justify-between">
                  <div className="w-full h-32 bg-slate-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-8 bg-slate-200 rounded w-full mt-4"></div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            // Zero Results Descriptive Fallback
            <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-xl border border-slate-200 border-dashed max-w-xl mx-auto w-full mt-8">
              <span className="text-3xl mb-2">🔍</span>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">No STEM Documents Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                No matching publications found for this configuration profile. Broaden your semantic filter settings or click above to force a manual synchronization trigger.
              </p>
            </div>
          ) : (
            // 3. Normalized Article Card Render Matrix Loop
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          )}

          {/* 4. Atomic Pagination Footer Controller Strip */}
          {paginationData.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 border-t border-slate-200 pt-6 mt-8">
              <button
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              
              <div className="text-xs font-bold text-slate-500 tracking-wide px-3">
                Page {currentPage} of {paginationData.totalPages}
              </div>

              <button
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, paginationData.totalPages))}
                disabled={currentPage === paginationData.totalPages}
              >
                Next →
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default App;