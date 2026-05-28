import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { AppAccessGate } from './features/settings/components/AppAccessGate';
import './styles/tokens.css';
import './styles/global.css';
import './styles/aferixTheme.css';

import { syncService } from './services/SyncService';

const rootElement = document.getElementById('root');

// Expose syncService to window for E2E tests
if (typeof window !== 'undefined') {
  (window as unknown as { syncService: typeof syncService }).syncService = syncService;
}

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppAccessGate>
        <App />
      </AppAccessGate>
    </React.StrictMode>,
  );
}
