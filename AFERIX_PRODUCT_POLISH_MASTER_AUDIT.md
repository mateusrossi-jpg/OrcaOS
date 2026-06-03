# AFERIX PRODUCT POLISH — MASTER AUDIT (V7.1)

**Mission:** Elevate Aferix from "Functional ERP" to "Indispensable Revenue Machine".
**Council Consensus:** The strategic foundation is excellent, but micro-frictions and architectural leakages prevent a "Score 10" experience.

---

## 🛡️ CONSELHO DE ESPECIALISTAS (PARECERES)

### 1. aferix-ui-auditor (Estética & Consistência)
*   **Excelente:** Aplicação do Tema Dark Premium (Black/Gold). Uso de fontes mono para valores financeiros.
*   **Abaixo do Padrão:** Inconsistência de margens (16px vs 24px) entre Home e Clientes.
*   **Gera Atrito:** Uso de `Input type="number"` padrão em vez do `MonetaryInput` estilizado.
*   **Parecer:** O produto parece "caro", mas falta polimento nas transições de estado.

### 2. aferix-architect (Integridade & Data Flow)
*   **Excelente:** Centralização da inteligência em `Engines` (Memory, Opportunity).
*   **Abaixo do Padrão:** `QuickServiceForm.tsx` toca diretamente no `db.attendances` (Leakage).
*   **Gera Atrito:** Lógica de `handleRepeatService` duplicada entre `ClientsWorkspace` e `QuickServiceForm`.
*   **Parecer:** Estabilização necessária no Facade para garantir que toda mutação seja via Event Store.

### 3. aferix-product-manager (Valor & Regra de Ouro)
*   **Excelente:** Client 360 focado em LTV e próxima oportunidade. Valor percebido imediato.
*   **Abaixo do Padrão:** `Revenue Velocity Score` é opaco; o usuário não sabe exatamente como melhorar.
*   **Reduz Valor:** Radar de Oportunidades não possui filtro por "Urgência" ou "Valor".
*   **Parecer:** O produto é indispensável para quem tem recorrência, mas precisa educar o usuário novo.

### 4. ux-audit (Heurísticas & Carga Cognitiva)
*   **Excelente:** Fluxo de "Repetir Serviço" (2 toques). Reconhecimento em vez de recordação.
*   **Aceitável:** Feedback de salvamento. O Toast é funcional, mas falta confirmação tátil/visual no botão.
*   **Gera Atrito:** Modais com excesso de informação secundária competindo com o CTA principal.
*   **Parecer:** Carga cognitiva baixa na execução, mas alta na análise de dados.

### 5. mobile-design (Ergonomia & Campo)
*   **Excelente:** Thumb-zone respeitada nos CTAs principais.
*   **Aceitável:** Lista de clientes. Com mais de 50 registros, o scroll se torna penoso sem indexação alfabética rápida.
*   **Gera Atrito:** Input de descrição minúsculo para quem está usando luvas ou no sol.
*   **Parecer:** Pronto para uso em pé, mas cansa em sessões longas de cadastro.

---

## 🚀 BACKLOG DE ATAQUE SISTEMÁTICO

### P0 — NAVEGAÇÃO E BLOQUEIOS (Urgente)
1.  **Refactor Facade:** Mover criação de `Attendance` do `QuickServiceForm` para o `operationalFacade`.
2.  **Alpha Indexer:** Adicionar scroll rápido alfabético na lista de clientes.

### P1 — UX & EFICIÊNCIA (Venda Rápida)
1.  **MonetaryInput Unified:** Substituir todos os inputs de valor por `MonetaryInput` com formatação BRL automática.
2.  **Touch Targets:** Aumentar área de toque dos chips de sugestão no `QuickServiceForm`.

### P2 — DESIGN SYSTEM & POLIMENTO (Premium Feel)
1.  **Margin Sync:** Padronizar todos os `ScreenContainer` e `Section` para margem de `24px` (Premium Spacing).
2.  **Haptic Feedback:** Adicionar feedback tátil (vibration) em todas as confirmações de faturamento.

### P3 — EMOÇÃO & RETENÇÃO (WOW)
1.  **Score Education:** Tooltip ou mini-modal explicando o `Revenue Velocity Score`.
2.  **Micro-celebrations:** Pequena faísca dourada ao clicar em "REPETIR SERVIÇO".

---

## 📊 TESTE DA VERGONHA (VEREDITO)
*   **Home:** Orgulho (Visual 10).
*   **Client 360:** Orgulho (Inteligência 10).
*   **Quick Form:** Aceitável (Funcional 10, Polimento 7).
*   **Geral:** O Aferix é hoje um produto nota 8.5. Com o ataque sistemático acima, atingirá o 10.
