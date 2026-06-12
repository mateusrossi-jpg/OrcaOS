# P98 — MVP Functional Truth Check

Este documento audita a realidade funcional do Aferix v0.1.0-RC1, classificando cada recurso para congelamento de escopo do MVP.

## 1. Tabela de Auditoria Funcional

| Tela | Função | Status | Problema | Decisão MVP |
| :--- | :--- | :--- | :--- | :--- |
| Home | Botão "Novo Orçamento" | FUNCIONAL | - | Manter |
| Home | KPIs de Lucro/Margem | FUNCIONAL | Baseado em dados do IndexedDB | Manter |
| Home | Lista "Continuar Trabalho" | FUNCIONAL | Carrega orçamentos em aberto | Manter |
| Orçamento | Cadastro de Preço/Título | FUNCIONAL | Persiste via Dexie | Manter |
| Orçamento | Custos e Deduções | FUNCIONAL | Cálculos em tempo real | Manter |
| Orçamento | Workflow (Rascunho -> Finalizado) | FUNCIONAL | Travamento de campos em Finalizado ok | Manter |
| Histórico | Busca e Filtros | FUNCIONAL | Filtro local via useBudgetHistory | Manter |
| Histórico | Menu "..." (Abrir/Excluir) | FUNCIONAL | Exclui do IndexedDB com confirmação | Manter |
| Financeiro | Resumo de Resultados | FUNCIONAL | Agregação de orçamentos finalizados | Manter |
| Clientes | Novo Cliente | FUNCIONAL | Persiste corretamente | Manter |
| Clientes | Novo Atendimento | FUNCIONAL | Cria vínculo com cliente | Manter |
| Catálogo | Biblioteca de Itens | FUNCIONAL | CRUD completo funcional | Manter |
| Catálogo | Estatísticas | FUNCIONAL | Cálculos locais de volume | Manter |
| Relatórios | Gerador de PDF/Impressão | FUNCIONAL | Via @react-pdf/renderer (offline) | Manter |
| Mais | Navegação do Hub | FUNCIONAL | Central de configurações | Manter |
| Backup | Exportação Local (JSON) | FUNCIONAL | Download do arquivo de backup | Manter |
| Backup | Google Drive Sync | PARCIAL | Depende de API key válida do usuário | Ocultar/Avisar Beta |
| Segurança | Bloqueio de Sessão | VISUAL APENAS | Não há PIN/Bio nativo no web | Ocultar do MVP |
| Licença Pro | Planos e Benefícios | VISUAL APENAS | Checkout simula abertura mas não processa | Manter como "Beta" |
| Perfil | Dados Profissionais | FUNCIONAL | Persiste e reflete nos orçamentos | Manter |
| Perfil | Editor de Logo | FUNCIONAL | Upload e crop funcional | Manter |

## 2. Resumo da Auditoria

- **Funções Reais:** Core de orçamentos, financeiro, clientes, catálogo e relatórios.
- **Funções Parciais:** Sincronização com nuvem (dependente de credenciais externas).
- **Funções Fake/Visuais:** Segurança avançada (bloqueio por senha) e processamento de pagamentos real.

## 3. Decisão Final do MVP

**MVP FUNCIONALMENTE CONFIÁVEL.**
O núcleo do produto (Orçamento -> Lucro -> PDF) está 100% operacional e persistente. Funções acessórias de "Segurança" que são meramente visuais devem ser desativadas para não gerar falsa expectativa. O fluxo de "Backup Cloud" será mantido como "Experimental/Beta".

---
*Assinado: Gemini CLI*
