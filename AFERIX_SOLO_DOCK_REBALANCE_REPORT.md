# AFERIX_SOLO_DOCK_REBALANCE_REPORT
MISSÃO: Rebalancear o Dock do perfil SOLO para alinhamento com a Constituição Business Owner.

## 1. Arquivos Alterados
*   `src/features/workspace/components/RoleShells.tsx`: Reorganização dos itens do Dock SOLO.
*   `src/app/screens/MenuScreen.tsx`: Inclusão do acesso ao módulo Equipe para o perfil SOLO.
*   `src/styles/design-system.css`: Ajustes visuais no `OperationalDock` para comportar 6 itens.

## 2. Ordem Final Escolhida (Opção 1)
1.  **Empresa** (id: `dashboard`)
2.  **Clientes** (id: `clients`)
3.  **Propostas** (id: `budgets`)
4.  **Agenda / OS** (id: `agenda`)
5.  **Financeiro** (id: `money`)
6.  **Menu** (id: `settings`)

### Justificativa da Escolha
Esta ordem segue o **Ciclo Natural do Negócio**:
*   A base de tudo é o **Cliente**.
*   Do cliente nasce a **Proposta** (Venda).
*   Da proposta aprovada nasce a **OS** (Execução).
*   Da execução nasce o **Financeiro** (Recebimento).
*   **Empresa** e **Menu** funcionam como as âncoras de cockpit e governança nas extremidades.

## 3. Evidências de Funcionamento

### Acessibilidade de Equipe
*   Validado que o item **"Equipe e Acessos"** agora é exibido no Menu para o perfil SOLO. Isso garante que o usuário consiga gerenciar permissões ou prestadores eventuais sem poluir o Dock diário.

### Ergonomia Mobile (Telas Pequenas)
*   **OperationalDock:** O gap foi reduzido de `8px` para `4px` e o preenchimento horizontal dos itens ajustado.
*   **Visual SE:** O Dock agora ocupa `max-width: 95vw`, garantindo que os 6 itens fiquem alinhados e sem sobreposição em dispositivos de ~320px de largura.
*   **Área de Toque:** A altura mínima foi elevada para `48px` para compensar a redução de largura, mantendo a facilidade de clique com uma mão (Thumb-First).

## 4. Resultado dos Testes
*   **Typecheck:** Verificado (erros legados permanecem isolados).
*   **Build:** ✅ VERDE (Produção).
*   **Navegação:** Validada a troca de abas entre os 6 módulos sem quebras de renderização.

---
*Assinado: Gemini CLI (Evidence-Based Observer)*
