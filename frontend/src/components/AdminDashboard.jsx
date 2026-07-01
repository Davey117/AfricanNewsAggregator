import React, { useEffect, useState } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '');

const defaultSourceForm = {
  name: '',
  siteUrl: '',
  feedUrl: '',
  feedType: 'rss',
  country: 'NG',
  language: 'en',
  defaultCategory: 'Higher Education',
  priority: 'standard',
  isActive: true,
};

function AdminDashboard({ onClose }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [adminUser, setAdminUser] = useState(() => {
    const cached = localStorage.getItem('adminUser');
    return cached ? JSON.parse(cached) : null;
  });
  const [activeTab, setActiveTab] = useState('sources');
  const [loginForm, setLoginForm] = useState({ email: 'admin@kwasu.edu.ng', password: 'password123' });
  const [sourceForm, setSourceForm] = useState(defaultSourceForm);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      loadSources();
    }
  }, [token]);

  async function loadSources() {
    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const payload = await request('/api/v1/feed', { method: 'GET' });
      const items = payload?.data?.sources || payload?.sources || [];
      setSources(items);
    } catch (error) {
      setStatus({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function request(path, options = {}) {
    const headers = { ...(options.headers || {}) };

    if (!headers.Authorization && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    const text = await response.text();
    let payload = {};

    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { message: text || 'Unexpected response from server.' };
    }

    if (!response.ok) {
      throw new Error(payload.message || `Request failed with status ${response.status}`);
    }

    return payload;
  }

  async function handleLogin(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', text: '' });

    try {
      const payload = await request('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      });

      const authToken = payload.token;
      const authUser = payload.admin || payload.user || null;

      if (!authToken) {
        throw new Error('Authentication succeeded but no token was returned.');
      }

      localStorage.setItem('adminToken', authToken);
      localStorage.setItem('adminUser', JSON.stringify(authUser));
      setToken(authToken);
      setAdminUser(authUser);
      setIsLoggedIn(true);
      setStatus({ type: 'success', text: 'Signed in successfully.' });
    } catch (error) {
      setStatus({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddSource(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', text: '' });

    try {
      const payload = await request('/api/v1/feed', {
        method: 'POST',
        body: JSON.stringify({
          ...sourceForm,
          isActive: sourceForm.isActive === true || sourceForm.isActive === 'true',
        }),
      });

      const createdSource = payload?.data?.source || payload?.source || null;
      if (createdSource) {
        setSources((current) => [createdSource, ...current]);
      } else {
        setSources((current) => [{ ...sourceForm, _id: Date.now().toString() }, ...current]);
      }

      setSourceForm(defaultSourceForm);
      setStatus({ type: 'success', text: 'News source added successfully.' });
    } catch (error) {
      setStatus({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteSource(sourceId) {
    setSubmitting(true);
    setStatus({ type: '', text: '' });

    try {
      await request(`/api/v1/feed/${sourceId}`, { method: 'DELETE' });
      setSources((current) => current.filter((item) => item._id !== sourceId));
      setStatus({ type: 'success', text: 'Source removed successfully.' });
    } catch (error) {
      setStatus({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTriggerCrawl() {
    setSubmitting(true);
    setStatus({ type: '', text: '' });

    try {
      const payload = await request('/api/v1/feed/auto-crawl', {
        method: 'POST',
        body: JSON.stringify({ priority: 'high' }),
      });
      setStatus({ type: 'success', text: payload.message || 'Crawl pipeline started successfully.' });
    } catch (error) {
      setStatus({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setToken('');
    setAdminUser(null);
    setIsLoggedIn(false);
    setSources([]);
    setStatus({ type: 'success', text: 'Signed out successfully.' });
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">Admin Control Center</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Manage your African News Aggregator</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Securely sign in, manage source registries, and launch ingestion jobs without leaving the browser.
              </p>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/20"
              >
                Exit Admin View
              </button>
            )}
          </div>
        </div>

        {status.text ? (
          <div className={`rounded-xl border px-4 py-3 text-sm ${status.type === 'error' ? 'border-rose-400/30 bg-rose-500/10 text-rose-200' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'}`}>
            {status.text}
          </div>
        ) : null}

        {!isLoggedIn ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white">Administrator Sign In</h2>
              <p className="mt-2 text-sm text-slate-400">Use your admin credentials to unlock source management and crawl controls.</p>
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Email Address</label>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm outline-none ring-0 focus:border-emerald-400"
                    value={loginForm.email}
                    onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Password</label>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm outline-none ring-0 focus:border-emerald-400"
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/20 to-slate-900 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-white">What you can do here</h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                <li>• Manage active news sources and add new feed registries.</li>
                <li>• Remove outdated or broken publishers instantly.</li>
                <li>• Trigger the ingestion pipeline for fresh article collection.</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-xl lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-300">Signed in as</p>
                <p className="text-lg font-medium text-white">{adminUser?.name || 'Administrator'}</p>
                <p className="text-sm text-slate-400">{adminUser?.email || 'admin access active'}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('sources')}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${activeTab === 'sources' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                >
                  Source Manager
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('controls')}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${activeTab === 'controls' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                >
                  System Controls
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/20"
                >
                  Logout
                </button>
              </div>
            </div>

            {activeTab === 'sources' ? (
              <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Active Sources</h2>
                      <p className="mt-1 text-sm text-slate-400">Review and remove registered publishers from your ingestion network.</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                      {sources.length} sources
                    </span>
                  </div>

                  {loading ? (
                    <div className="mt-6 rounded-xl border border-white/10 bg-slate-800/70 p-4 text-sm text-slate-400">Loading sources...</div>
                  ) : sources.length === 0 ? (
                    <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-slate-800/70 p-6 text-center text-sm text-slate-400">
                      No sources are currently registered.
                    </div>
                  ) : (
                    <div className="mt-6 space-y-3">
                      {sources.map((source) => (
                        <div key={source._id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-800/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-white">{source.name}</p>
                            <p className="mt-1 text-sm text-slate-400">{source.siteUrl}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                              {source.feedType} • {source.country} • {source.defaultCategory}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteSource(source._id)}
                            disabled={submitting}
                            className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl">
                  <h2 className="text-xl font-semibold text-white">Add New Source</h2>
                  <p className="mt-1 text-sm text-slate-400">Register a new publisher for scraping and normalization.</p>
                  <form onSubmit={handleAddSource} className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm text-slate-300">Source Name</label>
                        <input
                          type="text"
                          className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
                          value={sourceForm.name}
                          onChange={(event) => setSourceForm((current) => ({ ...current, name: event.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-slate-300">Homepage URL</label>
                        <input
                          type="url"
                          className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
                          value={sourceForm.siteUrl}
                          onChange={(event) => setSourceForm((current) => ({ ...current, siteUrl: event.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-slate-300">Feed URL</label>
                        <input
                          type="url"
                          className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
                          value={sourceForm.feedUrl}
                          onChange={(event) => setSourceForm((current) => ({ ...current, feedUrl: event.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-slate-300">Feed Type</label>
                        <select
                          className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
                          value={sourceForm.feedType}
                          onChange={(event) => setSourceForm((current) => ({ ...current, feedType: event.target.value }))}
                        >
                          <option value="rss">RSS</option>
                          <option value="scrape-static">Scrape Static</option>
                          <option value="scrape-dynamic">Scrape Dynamic</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-slate-300">Country</label>
                        <input
                          type="text"
                          maxLength={2}
                          className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm uppercase outline-none focus:border-emerald-400"
                          value={sourceForm.country}
                          onChange={(event) => setSourceForm((current) => ({ ...current, country: event.target.value.toUpperCase() }))}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-slate-300">Language</label>
                        <input
                          type="text"
                          className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm lowercase outline-none focus:border-emerald-400"
                          value={sourceForm.language}
                          onChange={(event) => setSourceForm((current) => ({ ...current, language: event.target.value.toLowerCase() }))}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-slate-300">Default Category</label>
                        <input
                          type="text"
                          className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
                          value={sourceForm.defaultCategory}
                          onChange={(event) => setSourceForm((current) => ({ ...current, defaultCategory: event.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-slate-300">Priority</label>
                        <select
                          className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
                          value={sourceForm.priority}
                          onChange={(event) => setSourceForm((current) => ({ ...current, priority: event.target.value }))}
                        >
                          <option value="high">High</option>
                          <option value="standard">Standard</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={sourceForm.isActive}
                        onChange={(event) => setSourceForm((current) => ({ ...current, isActive: event.target.checked }))}
                      />
                      Activate this source immediately
                    </label>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting ? 'Saving...' : 'Add Source'}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-8 shadow-xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">System Controls</h2>
                    <p className="mt-2 max-w-2xl text-sm text-slate-400">
                      Trigger the ingestion workflow to scrape and normalize fresh content from all active sources.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTriggerCrawl}
                    disabled={submitting}
                    className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? 'Starting crawl...' : 'Run Ingestion Pipeline'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
