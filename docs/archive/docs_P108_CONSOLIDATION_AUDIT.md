# AFERIX — P108 CONSOLIDATION AUDIT REPORT
**Status:** Audit Concluído | **Foco:** Estabilização e Orquestração Premium

## 1. Auditoria UX & Problemas Encontrados

### A. Fragmentação de Telas de Gestão
*   **Problema:** Enquanto as telas de `Resumo`, `Operação` e `Financeiro` atingiram o padrão V5 (Dark Premium), as telas de `Clientes`, `Relatórios` e `Catálogo` ainda apresentam resquícios de densidade visual do sistema antigo (OrcaOS).
*   **Impacto:** O usuário sente uma "quebra" de qualidade ao navegar para as abas secundárias.
*   **Ação:** Refatorar `ClientsScreen`, `ReportsScreen` e `CatalogScreen` para usar estritamente `Surface elevation-1`, `KpiCard` e a hierarquia de `SectionTitle` com eyebrows.

### B. Discoverability: Funções Escondidas
*   **Problema:** O **Catálogo** é uma ferramenta poderosa de produtividade, mas está "escondido" atrás de 3 cliques (Mais -> Catálogo).
*   **Problema:** Os **Relatórios** (BI) são o valor final do ERP, mas estão enterrados no menu.
*   **Ação:** Integrar atalhos contextuais. O Catálogo deve ser sugerido proativamente nos passos 4 e 5 do Orçamento. O Relatório deve ter um CTA na tela de Financeiro.

### C. Fluxos Operacionais "Travados"
*   **Problema:** O Pipeline de 11 passos é excelente para foco, mas falta uma via de "Fuga Rápida". Se o profissional quer apenas ajustar o preço na frente do cliente (Passo 8), ele precisa clicar em "Próximo" 7 vezes.
*   **Ação:** Permitir navegação direta via `WorkflowStepper` para qualquer etapa que não esteja bloqueada por regras de status.

### D. Modo Execução (OS) Subutilizado
*   **Problema:** O `FieldWorkTool` (Passo 10) é funcional, mas não assume o protagonismo quando um serviço está `EM_EXECUCAO`.
*   **Impacto:** O app parece um software de escritório, não uma ferramenta de campo.
*   **Ação:** Quando houver um serviço ativo, a `Home` deve exibir um botão "Entrar em Campo" que abre direto a `FieldWorkTool` em tela cheia.

---

## 2. Dívida Técnica & Arquitetural

*   **App.tsx Bloat:** O arquivo central está com mais de 200 linhas de lógica de navegação e migrações. Precisa de uma limpeza para se tornar um "Router" puramente declarativo.
*   **Event Store Sync:** O `FINANCIAL_MUTATION` está gerando eventos, mas a reconciliação visual (mostrar o histórico de mudanças no card de orçamento) ainda não está exposta para o usuário.
*   **Z-Index Consistency:** O `StickyActionBar` ainda "vaza" por cima de alguns modais no Safari.

---

## 3. Nova Arquitetura UX (Consolidada)

### O Shell Operacional (The Focus)
O app deve ser dividido em **Operativo** (Tabs 1, 2, 3, 4) e **Gestão** (Tab 5).
1.  **Resumo:** O que aconteceu hoje? (KPIs + Alertas).
2.  **Operação:** O que estou vendendo? (Pipeline de Orçamentos).
3.  **Execução:** O que estou fazendo agora? (Dashboard de OS Ativas).
4.  **Financeiro:** O que sobrou no bolso? (DRE + Extrato).
5.  **Menu:** Biblioteca e Configurações (Clientes, Catálogo, Relatórios, Cloud).

---

## 4. Próximos Passos (O Patch de Consolidação)

1.  **Refatoração do Catálogo & Clientes:** Alinhamento total ao padrão `oklch` e `Surface`.
2.  **Atalhos de Contexto:** Inserção do Catálogo no fluxo de Orçamento (Passo 4/5).
3.  **Home Ativa:** Lógica de "Serviço em Foco" para abertura rápida da ferramenta de campo.
4.  **Purificação de Navegação:** Permitir saltos no Stepper e limpar o `App.tsx`.

**Este é o plano de consolidação final para o P108.**
Deseja que eu inicie a purificação das telas de `Clientes` e `Catálogo` para zerar a dívida visual agora?
