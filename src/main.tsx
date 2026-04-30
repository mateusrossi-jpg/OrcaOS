import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './styles/global.css';
import './styles/mobileLayoutFix.css';
import './styles/workContext.css';
import './styles/professionalPolish.css';
import './styles/screenRefinement.css';
import './styles/budgetRefinement.css';
import './styles/clientOsRefinement.css';
import './styles/reportRefinement.css';
import './styles/calculationRefinement.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
