import React from 'react';
import { createRoot } from 'react-dom/client';
import ErrorBoundary from './components/common/ErrorBoundary';
import './index.css';
import App from './App.jsx';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
