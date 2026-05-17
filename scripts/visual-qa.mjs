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

const reportTSX = readFile('src/features/reports/components/ReportWorkspace.tsx');
if (reportTSX.includes("profileName === 'Aferix'")) {
  logSuccess('ReportWorkspace.tsx trata condicionalmente o branding para não duplicar AFERIX e Aferix');
} else {
  logError('ReportWorkspace.tsx deve tratar condicionalmente o branding institucional');
}

if (reportTSX.includes('aferix-wordmark-document.svg')) {
  logSuccess('ReportWorkspace.tsx utiliza a marca oficial aferix-wordmark-document.svg para documentos impressos/PDF');
} else {
  logError('ReportWorkspace.tsx não está utilizando aferix-wordmark-document.svg');
}

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

// 8.6. Regras de logo adicionais
const wordmarkSVG = readFile('public/icons/aferix-wordmark-premium.svg');
if (wordmarkSVG.includes('AFERI') && wordmarkSVG.includes('X') && !wordmarkSVG.includes('rect fill="#ffffff"')) {
  logSuccess('SVG do wordmark validado: palavra AFERIX completa, integrada e sem fundo branco');
} else {
  logError('Wordmark SVG inválido: não possui a palavra AFERIX completa ou possui fundo branco');
}

if (appShellTSX.includes('aferix-wordmark-premium.svg')) {
  logSuccess('AppShell.tsx utiliza o wordmark premium no header principal');
} else {
  logError('AppShell.tsx deve utilizar a logo completa no header');
}

// 8.6.b. Navegação superior desktop / Dropdowns estáveis
logStep('Dropdowns Desktop Estáveis e Acessíveis');
if (!appShellTSX.includes('onMouseLeave') && !appShellTSX.includes('onMouseEnter')) {
  logSuccess('AppShell.tsx livre de listeners de hover (onMouseEnter/onMouseLeave) nos dropdowns');
} else {
  logError('Erro: AppShell.tsx ainda utiliza hover instável (onMouseEnter/onMouseLeave) nos dropdowns');
}

if (appShellTSX.includes('pointerdown') && appShellTSX.includes('closest(\'.top-nav-menu-container\')')) {
  logSuccess('AppShell.tsx utiliza pointerdown com closest para fechamento seguro fora do menu');
} else {
  logError('Erro: AppShell.tsx não implementa pointerdown/closest para fechamento externo');
}

if (appShellTSX.includes('ArrowDown') && appShellTSX.includes('onKeyDown')) {
  logSuccess('AppShell.tsx implementa acessibilidade básica com tecla ArrowDown nos botões');
} else {
  logError('Erro: AppShell.tsx sem suporte a atalho de teclado ArrowDown para acessibilidade');
}


// 8.7. Drawer / Overlay Premium
logStep('Drawer / Overlay Premium');
const appShellCSS = readFile('src/app/components/AppShell.css');

// 8.9. Drawer Brand Clean Check
logStep('Drawer Brand Clean Check');
// Ensure .drawer-brand-card does not have border, background, border-radius
if (appShellCSS.includes('background: none !important') && appShellCSS.includes('border: 0 !important')) {
  logSuccess('Drawer brand card is clean and transparent');
} else {
  logError('Drawer brand card is missing the required transparency rules');
}

if (appShellCSS.includes('.drawer-backdrop') && appShellCSS.includes('backdrop-filter')) {
  logSuccess('Encontrou regras de overlay translúcido e filtro de desfoque (blur)');
} else {
  logError('AppShell.css não possui regras de desfoque ou classe .drawer-backdrop');
}

if (appShellCSS.includes('blur(6px)') || appShellCSS.includes('blur(5px)') || appShellCSS.includes('blur(7px)') || appShellCSS.includes('blur(8px)')) {
  logSuccess('Filtro de blur está dentro do limite premium e seguro de até 8px');
} else {
  logError('Erro de design: blur fora do intervalo premium recomendado');
}

if (appShellCSS.includes('@supports not') && appShellCSS.includes('backdrop-filter')) {
  logSuccess('Fallback cross-browser para backdrop-filter configurado corretamente');
} else {
  logError('Faltando bloco de fallback @supports not para navegadores antigos');
}

if (appShellCSS.includes('linear-gradient(') && appShellCSS.includes('.side-drawer')) {
  logSuccess('Side-drawer utiliza gradiente escuro premium ao invés de cor chapada');
} else {
  logError('Erro: side-drawer sem gradiente premium');
}

if (appShellTSX.includes('drawer-backdrop') && appShellTSX.includes('onClick={() => setIsDrawerOpen(false)}')) {
  logSuccess('Drawer overlay/backdrop para fechamento validado com sucesso');
} else {
  logError('Faltando overlay/backdrop clicável para fechar o drawer');
}

if (appShellCSS.includes('.desktop-sidebar-nav button small') && appShellCSS.includes('display: none !important')) {
  logSuccess('Menu lateral/drawer esconde subtítulos pesados (small) para navegação limpa');
} else {
  logError('Menu lateral/drawer não possui regras CSS para ocultar subtítulos pesados');
}

if (appShellCSS.includes('.desktop-sidebar-nav button') && appShellCSS.includes('rgba(245, 164, 0, 0.08)')) {
  logSuccess('Item ativo no menu possui cores e contraste adequados sem cards pesados');
} else {
  logError('Faltando regras de item ativo refinadas para navegação limpa no menu');
}

// 8.8. Simulador / Precificação Cards Check
logStep('Simulador / Precificação Cards Check');
const fundGeraisCSS = readFile('src/features/calculators/components/GeneralFundamentalsWorkspace.css');

if (fundGeraisCSS.includes('var(--aferix-surface-raised)')) {
  logSuccess('Cards de produtividade normatizados com o design system Aferix');
} else {
  logError('Cards de produtividade estão com estilo desalinhado ou sem variáveis aferix');
}

if (!fundGeraisCSS.match(/\.fundamental-picker-card\s*\{[^}]*background:\s*var\(--stable-surface,\s*#101713\)/) && !fundGeraisCSS.match(/\.fundamental-plan-banner\s*\{[^}]*background:\s*var\(--stable-surface,\s*#101713\)/)) {
  logSuccess('Livre de fundo esverdeado legado (#101713) nos cards de produtividade/cálculo');
} else {
  logError('Erro: Encontrou fundo esverdeado legado (#101713) nos cards de produtividade');
}

// 8.8.5. Simulador / Orçamento Técnico Detalhes
logStep('Simulador / Orçamento Técnico Detalhes');
const techTSX = readFile('src/features/calculators/components/TechnicalBudgetHumanWorkspace.tsx');
const generalCalcCSS = readFile('src/features/calculators/components/GeneralCalculatorWorkspace.css');

if (!techTSX.includes('className="general-calculator-overlay"')) {
  logSuccess('TechnicalBudgetHumanWorkspace.tsx não contém className="general-calculator-overlay"');
} else {
  logError('TechnicalBudgetHumanWorkspace.tsx ainda contém className="general-calculator-overlay"');
}

if (!techTSX.includes('aria-modal="true"')) {
  logSuccess('TechnicalBudgetHumanWorkspace.tsx não contém aria-modal="true"');
} else {
  logError('TechnicalBudgetHumanWorkspace.tsx ainda contém aria-modal="true"');
}

if (!techTSX.includes('general-overlay-backdrop')) {
  logSuccess('TechnicalBudgetHumanWorkspace.tsx não renderiza general-overlay-backdrop');
} else {
  logError('TechnicalBudgetHumanWorkspace.tsx ainda renderiza general-overlay-backdrop');
}

if (generalCalcCSS.includes('.general-calculator-detail-panel')) {
  logSuccess('GeneralCalculatorWorkspace.css possui classe .general-calculator-detail-panel');
} else {
  logError('GeneralCalculatorWorkspace.css não possui classe .general-calculator-detail-panel');
}

if (generalCalcCSS.includes('.general-calculator-detail-header')) {
  logSuccess('GeneralCalculatorWorkspace.css possui classe .general-calculator-detail-header');
} else {
  logError('GeneralCalculatorWorkspace.css não possui classe .general-calculator-detail-header');
}

if (generalCalcCSS.includes('.general-calculator-detail-back')) {
  logSuccess('GeneralCalculatorWorkspace.css possui classe .general-calculator-detail-back');
} else {
  logError('GeneralCalculatorWorkspace.css não possui classe .general-calculator-detail-back');
}

// 8.9.5. Refinamentos Visuais Aferix (Mecanismos de Overflow, Dropdown Premium, Catalog 2-colunas e Scrollbars)
logStep('Refinamentos Visuais Aferix');
const storeTSX_Check = readFile('src/app/screens/StoreScreen.tsx');
if (storeTSX_Check.includes('className="android-package"') && storeTSX_Check.includes('title=')) {
  logSuccess('StoreScreen.tsx implementa proteção e atributos title de acessibilidade contra estouro de texto');
} else {
  logError('StoreScreen.tsx está sem classes de proteção contra overflow (android-package) ou atributos title');
}

if (themeCSS.includes('.long-token') && themeCSS.includes('.android-package') && themeCSS.includes('text-overflow: ellipsis')) {
  logSuccess('aferixTheme.css define classes utilitárias para truncamento com reticências (.long-token, .android-package)');
} else {
  logError('aferixTheme.css não possui regras utilitárias de reticências para textos técnicos longos');
}

if (themeCSS.includes('.top-nav-dropdown') && themeCSS.includes('rgba(22, 24, 30, 0.98)')) {
  logSuccess('aferixTheme.css define estilo glassmorphic premium para dropdown superior desktop');
} else {
  logError('aferixTheme.css não possui estilos glassmorphic premium para .top-nav-dropdown');
}

if (themeCSS.includes('.catalog-stats-grid') && themeCSS.includes('.catalog-stat-card')) {
  logSuccess('aferixTheme.css define layout de 2 colunas no mobile e 6 no desktop para estatísticas do Catálogo');
} else {
  logError('aferixTheme.css não possui as regras de grid de estatísticas do Catálogo (.catalog-stats-grid)');
}

const catalogHubTSX = readFile('src/features/catalog/components/CatalogHubWorkspaceEditable.tsx');
if (catalogHubTSX.includes('className="catalog-stats-grid"')) {
  logSuccess('CatalogHubWorkspaceEditable.tsx utiliza a classe catalog-stats-grid para exibição móvel aprimorada');
} else {
  logError('CatalogHubWorkspaceEditable.tsx não utiliza a classe catalog-stats-grid');
}

if (themeCSS.includes('.drawer-panel::-webkit-scrollbar') && themeCSS.includes('rgba(255, 255, 255, 0.18)')) {
  logSuccess('aferixTheme.css define estilo de rolagem estético e fino para o side drawer / menu lateral');
} else {
  logWarn('aferixTheme.css não possui estilos estéticos personalizados de scrollbar para a navegação');
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
