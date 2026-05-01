import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/AppOrcaNext';
import './styles/global.css';
import './styles/mobileLayoutFix.css';
import './styles/workContext.css';
import './styles/professionalPolish.css';
import './styles/screenRefinement.css';
import './styles/budgetRefinement.css';
import './styles/clientOsRefinement.css';
import './styles/reportRefinement.css';
import './styles/calculationRefinement.css';
import './styles/calculationTaxonomyVisual.css';
import './styles/storeSettingsRefinement.css';
import './styles/responsiveConsistency.css';
import './styles/premiumPartsAndIcons.css';
import './styles/orcaosOfficialTheme.css';
import './styles/orcaosApprovedConcept.css';
import './styles/orcaosLayoutComposition.css';
import './styles/orcaosVisualStabilization.css';
import './styles/orcaosDarkThemeLock.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
