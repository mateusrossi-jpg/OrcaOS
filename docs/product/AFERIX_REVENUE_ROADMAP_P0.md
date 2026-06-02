# AFERIX REVENUE ROADMAP P0
**A Marcha Implacável para os primeiros R$ 100k**

Para faturarmos corretivas maciçamente através deste motor, a complexidade foi fatiada:

## Fase 1: Domain & Database (Back-office)
*   **Dexie:** Adicionar schema `anomalies` e `proposals` com os índices descritos.
*   **Supabase:** Migrações PostgreSQL espelhando o Dexie + RLS Policies.
*   **Typescript:** Tipagem pesada dos domínios e das funções de Sync.

## Fase 2: Field Catch (UX do Técnico)
*   Interceptar a marcação "Não Conforme" na `ChecklistEngine`.
*   Criar o componente `AnomalyBottomSheet` focado em One-Hand.
*   Implementar `navigator.mediaDevices` para câmera ultrarrápida nativa e persistência de BLOB da foto.
*   *Pronto: Anomalias começam a cair no banco.*

## Fase 3: Revenue Inbox (A Mesa do Chefe)
*   Criar o componente Kanban `CommercialInbox`.
*   Implementar a função de Merge `Anomaly -> Proposal` (Zero digitação, puxar referências).
*   Tela de edição de preço final da Proposta.

## Fase 4: The Golden Link (Portal do Cliente)
*   Subir uma rota pública sem autenticação no App (ex: `/p/:token`).
*   Construir a Landing Page visualmente matadora.
*   Integrar o `SignaturePad` via web.

## Fase 5: Automagic Conversions (Event Bus)
*   Criar o hook que "Escuta" a tabela de `Proposals` no Supabase. Quando mudar para `APPROVED`, inserir um registro na tabela `workOrders` vinculado ao `anomalyId`.

**Executive Verdict:** Foco militar nas Fases 1 e 2. Se o técnico não conseguir registrar a anomalia em 15 segundos na chuva, não existirá proposta, não existirá portal e não existirá dinheiro. A execução começa pelas trincheiras do banco de dados e UI do campo.
