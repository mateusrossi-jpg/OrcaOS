# AFERIX — MASTER PRODUCT EVOLUTION ROADMAP
ERP PREMIUM • SAAS MOBILE-FIRST • LOCAL-FIRST • OFFLINE-FIRST

## Visão Geral
O Aferix não é apenas um app de orçamentos; é o **Sistema Operacional de Bolso** do prestador de serviço. É um produto premium, técnico, moderno e, acima de tudo, extremamente confiável.

## Regra de Ouro (Core Mandate)
**TUDO GIRA EM TORNO DO ORÇAMENTO.**
O orçamento é o núcleo: cliente, lucro, execução, evidências e financeiro emanam dele.

---

## 1. Identidade Visual & Design (Premium Dark)
O Aferix deve parecer caro, sério e profissional.
- **Tema:** Dark Premium.
- **Cores:** 
    - Fundo: Preto/Grafite profundo.
    - Cards: Dark elevado.
    - Accent: Amarelo/Dourado (Ação principal).
    - Status: Verde (Lucro/Sucesso), Vermelho (Perda/Alerta).
- **Proibido:** Teal/Cyan como cor principal, excesso de bordas/glow/gradientes, cards gigantes, textos cinza ilegíveis.
- **UX:** Foco em velocidade, clareza e operação com uma mão (uso em campo).

## 2. Arquitetura & Fluxo de Dados
- **React NÃO toca no banco.**
- **Fluxo:** React -> Hooks -> Services -> Repositories -> Storage.
- **Offline-First:** Não é uma feature, é a identidade. O sistema nunca abandona o usuário. Persistência forte e sync silencioso.

## 3. Próximas Fases (Master Roadmap)
1.  **FASE 1: ESTABILIZAÇÃO PREMIUM (CONCLUÍDA)**
    *   Padronização visual total e mobile-first real.
    *   Ações operacionais centralizadas na `StickyActionBar`.
    *   Correção de bloqueios de toque e overlays no iOS.
2.  **FASE 2: HARDENING & EVENT STORE (CONCLUÍDA)**
    *   Trilha operacional determinística (`FINANCIAL_MUTATION`).
    *   Snapshots financeiros imutáveis em transições de status.
    *   Motor de reconciliação e auditoria de integridade automática.
3.  **FASE 3: CLOUD & SAAS (CONCLUÍDA - FUNDAÇÃO)**
    *   Sincronização híbrida via Supabase Event Store replication.
    *   Replicação offline-first com reconciliação cloud.

## 4. Mandatos Arquiteturais (Novos)
*   **Fluxo de Mutação:** NENHUMA alteração financeira ou de status deve tocar o banco sem passar pelo `operationalFacade`. O Facade é o único que emite os eventos de mutação necessários para o Hardening.
*   **Event Store:** O Event Store (`operationalEvents`) é a Fonte da Verdade para auditoria. O estado do banco (`budgets`) deve ser derivável da trilha de eventos.
*   **Sincronização:** O app é offline-first. A sincronização cloud é um espelhamento da trilha de eventos local para replicação multi-dispositivo.
*   **Cálculos:** O `BudgetCalculatorService` é a única autoridade de cálculo. Snapshots financeiros são congelados no momento da finalização para garantir histórico imutável.

## 4. Proibições e Restrições
- **Overengineering:** Sem CQRS, event bus complexo, DI pesada ou state machines gigantes.
- **Dashboard Corporativo:** A home deve ser operacional (continuar trabalho, novo orçamento, lucro), não um painel de métricas inúteis.
- **Complexidade Desnecessária:** Se não ajuda o prestador a ganhar dinheiro ou economizar tempo, não deve estar no app.

---

## Diretrizes de Implementação
- **Formulários:** 1 coluna no mobile, inputs full-width, labels legíveis, áreas de toque grandes.
- **Status do Orçamento:** Iniciado -> Enviado -> Autorizado -> Em Execução -> Pausado -> Finalizado -> Recusado -> Arquivado.
- **Feedback:** Toda ação deve ser confirmada visualmente ou taticamente (salvamento automático, sync).
