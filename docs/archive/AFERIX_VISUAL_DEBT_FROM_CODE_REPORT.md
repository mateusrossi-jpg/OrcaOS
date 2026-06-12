# AFERIX VISUAL DEBT FROM CODE REPORT
**Date:** 2026-06-03
**Scope:** Frontend Codebase (`src/`)

## Executive Summary
A auditoria revelou que, embora o sistema de design (Tokens e Storybook) exista, muitas partes do sistema ainda utilizam hardcoded values e contornam as primitivas definidas. O tema *Dark Premium* está sendo implementado com variações isoladas ao invés de usar as classes semânticas.

## P0: Critical Integrity Breaches
*Ameaçam a identidade da marca e quebram o Dark Mode Premium.*

1. **Cores Hardcoded em Layouts Base:**
   - Telas mestres como `ClientPortalPage.tsx`, `PortalContractCenter.tsx`, `DispatchBoardPage.tsx` estão forçando `bg-[#050505]` no nível superior em vez de utilizar o token de fundo do layout global `bg-[var(--bg-primary)]`.
   - Modais (ex: `ActionSheet.tsx`, `ExecutionClosingFlow.tsx`) estão forçando `bg-[#0F0F0F]` e `bg-[#050505]` ao invés das classes corretas (ex: `bg-[var(--bg-surface-elevated)]`).

2. **Cores Semânticas Hardcoded:**
   - Muitos componentes (ex: `CRMColumn.tsx`, `OperationalPressureCard.tsx`) estão usando paletas utilitárias como `bg-gray-900`, `border-gray-800`, `text-gray-200`. Isso foge do protocolo *Dark Premium* do Aferix, que depende dos tokens text-primary, text-secondary e bg-surface.
   - Textos sendo forçados para `text-[#EFEFEF]` (ex: `app/components/ui/index.tsx`) em vez do token `text-[var(--text-primary)]`.

## P1: UI Primitive Violations
*Ignorando componentes do Storybook a favor de marcação manual.*

1. **Botões "Frankenstein":**
   - Diversos botões estão reconstruindo o layout de ação em vez de importar `PrimaryButton`, `SecondaryButton` etc. Exemplo em `ChecklistExecutionPage.tsx`: `bg-white text-[#050505] font-black ...`.
   
2. **Badges/Chips Despadronizados:**
   - Features usando marcação própria para badges em vez de `OpsChip` ou `Badge`. Exemplo em `RetentionCenterPage.tsx`: `bg-status-error text-[#050505] px-2 py-0.5 rounded-full text-[10px] font-bold`.

3. **Laudo Técnico (TechnicalReportEngine.tsx):**
   - O gerador de PDF/HTML do laudo está injetando dezenas de `text-gray-900`, `text-gray-600`, etc., criando um visual não-premium e desalinhado com o documento exportável pretendido pela plataforma.

## P2: Consistency & Ergonomics
*Pequenas dívidas que afetam o refinamento final.*

1. **Screaming Hex Codes nos Ícones:**
   - Ícones SVG importando `text-[#050505]` (ex: `Asset360Page.tsx`) ou `text-[#3A3A3A]`. Estes deveriam herdar a cor do contêiner ou usar os tokens de acento ou *muted*.
2. **Uso de Flexbox Inline vs Componentes de Grid/Layout:**
   - Inúmeras classes `flex flex-col gap-X` e `items-center` se repetindo para recriar o `ListCard` ou o `InteractiveRow`.

## Next Steps
Para alcançar a Fase 7 (Migração), o próximo foco será:
1. Encontrar e substituir os fundos `bg-[#050505]` e `bg-[#0F0F0F]` por `bg-[var(--bg-primary)]` e `bg-[var(--bg-surface)]`.
2. Refatorar as telas de CRM, Dispatch e Settings para consumir o `SurfaceCard` e os Tokens de Typography em vez da paleta `gray-*` utilitária do Tailwind.
3. Substituir os botões isolados por `PrimaryButton` / `DangerButton`.