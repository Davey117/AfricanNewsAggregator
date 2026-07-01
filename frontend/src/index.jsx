// src/index.js (or src/main.jsx)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SearchAndFilterProvider } from './context/SearchAndFilterContext';
import './index.css'; // Tailwind configuration or custom standard layout styles

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SearchAndFilterProvider>
      <App />
    </SearchAndFilterProvider>
  </React.StrictMode>
);