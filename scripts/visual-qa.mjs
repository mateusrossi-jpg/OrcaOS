import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const readFile = (relativePath) => {
  try {
    return readFileSync(resolve(__dirname, '../', relativePath), 'utf-8');
  } catch (error) {
    return '';
  }
};

let hasCriticalErrors = false;
let warnings = 0;

const logStep = (stepName) => console.log(`\n\x1b[36m➤ Validando: ${stepName}\x1b[0m`);
const logSuccess = (msg) => console.log(`  \x1b[32m✔ ${msg}\x1b[0m`);
const logError = (msg) => {
  console.log(`  \x1b[31m✖ ERRO CRÍTICO: ${msg}\x1b[0m`);
  hasCriticalErrors = true;
};
const logWarn = (msg) => {
  console.log(`  \x1b[33m⚠ AVISO: ${msg}\x1b[0m`);
  warnings++;
};

console.log(`\n\x1b[1m=====================================================\x1b[0m`);
console.log(`\x1b[1m  AFERIX VISUAL & STRUCTURAL QA CHECKLIST\x1b[0m`);
console.log(`\x1b[1m=====================================================\x1b[0m`);

// 2. Preferências do App
logStep('Preferências do App (ProfessionalProfileWorkspace)');
const profTSX = readFile('src/features/settings/components/ProfessionalProfileWorkspace.tsx');
['professional-profile-workspace', 'professional-profile-header-card', 'professional-profile-section', 'professional-profile-grid', 'professional-logo-editor', 'professional-profile-id-grid', 'professional-profile-id-card', 'professional-profile-save-row'].forEach(cls => {
  if (profTSX.includes(cls)) logSuccess(`Encontrou estrutura correta: ${cls}`);
  else logError(`Faltando classe estrutural: ${cls}`);
});
['aferix-panel-card', 'dashboard-finance-tiles', 'finance-tile', 'action-button-container', 'style={'].forEach(cls => {
  if (!profTSX.includes(cls)) logSuccess(`Livre de padrão legado: ${cls}`);
  else logError(`Encontrou regressão legacy: ${cls}`);
});

const profCSS = readFile('src/features/settings/components/ProfessionalProfileWorkspace.css');
['.professional-profile-workspace .budget-field', 'display: grid', 'width: 100%', '.professional-profile-workspace .budget-field input', '.professional-profile-workspace .budget-field textarea', '.professional-profile-grid', 'grid-template-columns: repeat(2', '@media (max-width: 760px)', 'grid-template-columns: 1fr'].forEach(rule => {
  if (profCSS.includes(rule)) logSuccess(`Encontrou regra CSS correta: ${rule.substring(0, 30)}`);
  else logError(`Faltando regra CSS: ${rule}`);
});

// 3. Configurações / Tabs
logStep('Configurações / Tabs (global.css)');
const globalCSS = readFile('src/styles/global.css');
['overflow-x: auto', 'flex-wrap: nowrap', 'scrollbar-width: none', '@media (min-width: 900px)', 'grid-template-columns: repeat(5'].forEach(rule => {
  if (globalCSS.includes(rule)) logSuccess(`Encontrou regra global correta: ${rule}`);
  else logError(`Faltando regra global: ${rule}`);
});
if (!globalCSS.match(/\.settings-section-tabs[^}]*flex-wrap:\s*wrap/)) logSuccess(`Livre de quebra flex-wrap indevida`);
else logError(`Regra indevida de flex-wrap encontrada.`);
if (!globalCSS.match(/\.settings-section-tabs[^}]*overflow:\s*hidden\s*!important/)) logSuccess(`Livre de overflow hidden indevido`);
else logError(`Regra indevida de overflow hidden encontrada.`);

// 4. Relatórios
logStep('Relatórios (ReportWorkspace.css)');
const reportCSS = readFile('src/features/reports/components/ReportWorkspace.css');
['.report-document,', 'color-scheme: light', 'background: #fcfbf8', 'color: #111827', '.report-document :where(h1, h2, h3, strong)', '.report-empty-state', '@media (max-width: 640px)', '@media print'].forEach(rule => {
  if (reportCSS.includes(rule)) logSuccess(`Regra de relatório encontrada: ${rule}`);
  else logError(`Faltando regra de relatório: ${rule}`);
});
if (!reportCSS.includes('High-contrast Light Mode Protection for Reports')) logSuccess(`Livre de comentário legado`);
else logError(`Encontrou duplicação antiga (High-contrast Light Mode Protection)`);

// 5. Propostas / Orçamento
logStep('Propostas / Orçamento (BudgetWorkspace.css)');
const budgetCSS = readFile('src/features/budgets/components/BudgetWorkspace.css');
['.budget-workspace', 'overflow-x: hidden', '.budget-workspace-tabs', '.budget-workspace-stepper', 'overflow-x: auto', '.budget-workspace-tabs button.active', '.budget-sticky-summary', '.highlight-profit', '@media (max-width: 760px)'].forEach(rule => {
  if (budgetCSS.includes(rule)) logSuccess(`Regra de orçamento encontrada: ${rule}`);
  else logError(`Faltando regra de orçamento: ${rule}`);
});
['var(--orca-text', 'var(--orca-muted', 'var(--orca-accent', 'var(--orca-primary'].forEach(rule => {
  if (!budgetCSS.includes(rule)) logSuccess(`Livre de variável orca legada: ${rule}`);
  else logError(`Encontrou variável legada: ${rule}`);
});
['#000000', '#222222', 'border-radius: 4px', 'text-transform: uppercase'].forEach(token => {
  if (budgetCSS.includes(token)) logWarn(`Fallback visual/legado encontrado em BudgetWorkspace.css: ${token}`);
});

// 6. Licença
logStep('Licença (StoreScreen.tsx)');
const storeTSX = readFile('src/app/screens/StoreScreen.tsx');
['PageShell', 'PageHeader', 'PlanCard', 'plan-card-grid', 'details', 'FREE', 'PRO', 'VITALÍCIO'].forEach(token => {
  if (storeTSX.includes(token)) logSuccess(`Token da licença encontrado: ${token}`);
  else logError(`Faltando token da licença: ${token}`);
});
['GrátisBásico', 'validaçãoProfissional', 'sugeridoRecursos'].forEach(token => {
  if (!storeTSX.includes(token)) logSuccess(`Livre de texto colado antigo: ${token}`);
  else logError(`Encontrou texto colado antigo: ${token}`);
});

// 7. Simulador / Precificação
logStep('Simulador / Precificação (CalculationsScreen.tsx)');
const calcTSX = readFile('src/app/screens/CalculationsScreen.tsx');
['Simulador de Preços', 'AferixTabs', 'calculation-context-card', 'metric-grid', 'compact-metric-grid', 'Ferramentas disponíveis'].forEach(token => {
  if (calcTSX.includes(token)) logSuccess(`Token de simulação encontrado: ${token}`);
  else logError(`Faltando token de simulação: ${token}`);
});
['Cálculo avulsoSem atendimento ativo', 'Cálculos comerciaisFree para testar', '13livres', '17Pro', 'OrçamentoProdutividadePercentuais'].forEach(token => {
  if (!calcTSX.includes(token)) logSuccess(`Livre de texto colado legado: ${token}`);
  else logError(`Encontrou texto colado legado: ${token}`);
});

// 8. ContextBanner / Atendimentos
logStep('ContextBanner / Atendimentos (aferixTheme.css)');
const themeCSS = readFile('src/styles/aferixTheme.css');

['.context-banner', '.context-banner-action'].forEach(cls => {
  if (themeCSS.includes(cls)) logSuccess(`Encontrou classe do banner de contexto: ${cls}`);
  else logError(`Faltando classe do banner de contexto: ${cls}`);
});

['grid-template-columns: auto minmax(0, 1fr) auto', '@media (max-width: 760px)', 'grid-column: 1 / -1', 'width: 100%', 'min-width: 0'].forEach(rule => {
  if (themeCSS.includes(rule)) logSuccess(`Encontrou regra de segurança no CSS: ${rule}`);
  else logError(`Faltando regra de segurança no CSS: ${rule}`);
});

// Validar que não existe position: absolute
if (!themeCSS.match(/\.context-banner-action[^}]*position:\s*absolute/)) {
  logSuccess('Livre de position: absolute indevido no botão de contexto');
} else {
  logError('Erro crítico: botão do contexto ativo usando position: absolute!');
}

// Validar que não existe transform
if (!themeCSS.match(/\.context-banner-action[^}]*transform:/)) {
  logSuccess('Livre de transform indevido no botão de contexto');
} else {
  logError('Erro crítico: botão do contexto ativo usando transform!');
}

// Validar que não existe margin-top negativo
if (!themeCSS.match(/\.context-banner-action[^}]*margin-top:\s*-\d+/)) {
  logSuccess('Livre de margin-top negativo indevido no botão de contexto');
} else {
  logError('Erro crítico: botão do contexto ativo usando margin-top negativo!');
}

// 8.5. Branding, Logo e Intro
logStep('Branding, Logo e Intro');
const appTSX = readFile('src/app/App.tsx');
if (appTSX.includes('AferixIntro')) {
  logSuccess('Encontrou componente AferixIntro importado e renderizado no App.tsx');
} else {
  logError('Componente AferixIntro ausente no App.tsx');
}

const appShellTSX = readFile('src/app/components/AppShell.tsx');
if (appShellTSX.includes('aferix-wordmark-premium.svg') && appShellTSX.includes('aferix-mark-premium.svg')) {
  logSuccess('Encontrou os novos SVGs de branding premium mapeados no AppShell.tsx');
} else {
  logError('AppShell.tsx ainda utiliza marcas/imagens legadas do Aferix');
}

const introTSX = readFile('src/app/components/AferixIntro.tsx');
if (introTSX.includes('Gestão financeira para autônomos') && introTSX.includes('aferix-splash-mark.svg')) {
  logSuccess('Estrutura e copy da Intro validadas no AferixIntro.tsx');
} else {
  logError('AferixIntro.tsx não contém as frases de posicionamento financeiro premium ou logo correto');
}

// 9. Design Tokens
logStep('Design Tokens (aferixTheme.css)');
['--aferix-bg', '--aferix-surface', '--aferix-surface-2', '--aferix-border', '--aferix-text', '--aferix-text-secondary', '--aferix-primary', '--aferix-danger'].forEach(token => {
  if (themeCSS.includes(token)) logSuccess(`Token essencial encontrado: ${token}`);
  else logError(`Faltando token essencial: ${token}`);
});
if (themeCSS.includes('--aferix-success') || themeCSS.includes('--aferix-green')) logSuccess(`Token de sucesso encontrado (--aferix-success/green)`);
else logError(`Faltando token de sucesso`);

console.log(`\n\x1b[1m=====================================================\x1b[0m`);
if (hasCriticalErrors) {
  console.log(`\x1b[31m✖ Falha no QA Visual! Corrija os erros listados acima.\x1b[0m`);
  process.exit(1);
} else {
  console.log(`\x1b[32m✔ QA Visual Passou com sucesso!\x1b[0m (${warnings} warnings encontrados)`);
  process.exit(0);
}
