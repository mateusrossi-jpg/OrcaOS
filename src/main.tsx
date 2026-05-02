import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/AppOrcaNextOrganized';
import { AppAccessGate } from './features/settings/components/AppAccessGate';
import './styles/global.css';
import './styles/orcaosMvpTheme.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppAccessGate>
        <App />
      </AppAccessGate>
    </React.StrictMode>,
  );
}
