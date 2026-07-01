// src/App.js
import React, { useEffect, useState } from 'react';
import NavigationHeader from './components/NavigationHeader';
import CategorySidebar from './components/CategorySidebar';
import ArticleCard from './components/ArticleCard';
import AdminDashboard from './components/AdminDashboard';
import { useFetchArticles } from './hooks/useFetchArticles';
import { useSearchAndFilter } from './context/SearchAndFilterContext';

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

function App() {
  const { articles, loading, error, paginationData } = useFetchArticles();
  const { currentPage, setCurrentPage } = useSearchAndFilter();
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (path) => {
    const nextPath = normalizePath(path);
    window.history.pushState({}, '', nextPath);
    setCurrentPath(nextPath);
  };

  const isAdminRoute = currentPath === '/admin';

  if (isAdminRoute) {
    return <AdminDashboard onClose={() => navigateTo('/')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">

      <NavigationHeader />

      <div className="max-w-7xl w-full mx-auto flex-grow flex flex-col md:flex-row px-4 py-6 gap-6">
        <CategorySidebar />

        <main className="flex-grow flex flex-col justify-between">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-4 font-semibold shadow-sm mb-6">
              ⚠️ Ingestion Retrieval Alert: {error}. Check your backend server state loop logs.
            </div>
          )}

          {loading ? (
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
            <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-xl border border-slate-200 border-dashed max-w-xl mx-auto w-full mt-8">
              <span className="text-3xl mb-2">🔍</span>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">No STEM Documents Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                No matching publications found for this configuration profile. Broaden your semantic filter settings or click above to force a manual synchronization trigger.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          )}

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