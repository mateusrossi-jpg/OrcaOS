# Aferix — Release Candidate Checklist

## Status geral

- Dark theme estabilizado.
- Catálogo padronizado.
- Redundâncias UX reduzidas.
- Simulador sem overlay quebrado no detalhe principal de orçamento.
- Orçamentos com fluxo linear: Projeto, Escopo, Custos, Comercial e Proposta.
- Brand assets revisados para app icon, splash, AppShell, PWA e documentos.

## Checklist manual

- Dashboard: validar KPIs, atalhos e ausência de scroll horizontal no mobile.
- Clientes/Atendimentos: validar toolbar Painel, Clientes e Histórico; Novo cliente dentro de Clientes; Novo atendimento no contexto.
- Propostas/Orçamentos: criar orçamento, adicionar item no Escopo, conferir item na lista e na prévia, gerar PDF.
- Financeiro: criar lançamento, buscar no histórico, editar e remover.
- Catálogo: revisar Itens, Fornecedores, Margem, Busca Online e Estoque em mobile.
- Simulador: abrir cálculo, preencher campos, adicionar resultado ao atendimento/orçamento e voltar.
- Compras: validar lista de compra do cliente e botão Copiar lista.
- Relatórios: validar documento claro, logo correto e Imprimir/PDF.
- Licença: validar cards de plano, status, IDs truncados e ausência de CTA duplicado.
- Configurações: validar Perfil, Segurança, Backup, Preferências e Sobre.
- Ícone/Splash/Manifest: validar launcher, splash, intro, manifest e cores de instalação.

## Bloqueadores corrigidos nesta rodada

- Configurações/Sobre: removidos tokens e cores legadas dos painéis de conformidade legal.
- Configurações/Perfil: removidos tokens e superfícies legadas do card de identidade profissional.
- Propostas/PDF: removido token legado do alerta de validação da prévia de impressão.
- Licença: plano Vitalício desabilitado comunica `Planejado`, sem competir com o CTA Pro.
- QA automático: guardrails de RC cobrem manifesto, ícone, AppShell, documento, fluxo de Propostas, Clientes, Simulador, Catálogo e guia UX.

## Pendências não bloqueantes

- Catálogo ainda usa `Novo Item` em toolbar interna. Mantido por segurança após a padronização visual recente.
- Alguns módulos técnicos antigos ainda possuem tokens `orca` em CSS fora das telas principais estabilizadas. Recomendado migrar em rodada própria.
- Android: revisar PNG/adaptive icons em Android Studio antes do build final de Play Store.
- Teste manual em Android real ainda é necessário para validar launcher, splash nativo, teclado numérico e recortes de viewport.
- `visual:qa` mantém warnings antigos em `BudgetWorkspace.css` para fallbacks visuais não bloqueantes.

## Comandos de validação

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run visual:qa`
- `npm run rc:check`
