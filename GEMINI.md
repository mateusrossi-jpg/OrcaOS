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
1. **FASE 1: ESTABILIZAÇÃO PREMIUM (FOCO ATUAL)**
   - Padronização visual total.
   - Mobile-first real (uma mão, alta legibilidade sob sol).
   - Eliminação de poluição visual e redundâncias.
   - Hierarquia visual profissional.
2. **FASE 2: HARDENING & EVENT STORE**
   - Trilha operacional determinística (Event Store).
   - Confiabilidade total nos cálculos de lucro/margem.
3. **FASE 3: CLOUD & SAAS**
   - Sync opcional, cloud híbrida, multi-device, colaboração.

## 4. Proibições e Restrições
- **Overengineering:** Sem CQRS, event bus complexo, DI pesada ou state machines gigantes.
- **Dashboard Corporativo:** A home deve ser operacional (continuar trabalho, novo orçamento, lucro), não um painel de métricas inúteis.
- **Complexidade Desnecessária:** Se não ajuda o prestador a ganhar dinheiro ou economizar tempo, não deve estar no app.

---

## Diretrizes de Implementação
- **Formulários:** 1 coluna no mobile, inputs full-width, labels legíveis, áreas de toque grandes.
- **Status do Orçamento:** Iniciado -> Enviado -> Autorizado -> Em Execução -> Pausado -> Finalizado -> Recusado -> Arquivado.
- **Feedback:** Toda ação deve ser confirmada visualmente ou taticamente (salvamento automático, sync).
