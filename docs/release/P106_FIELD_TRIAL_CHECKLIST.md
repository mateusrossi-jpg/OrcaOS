# P106 — FIELD TRIAL CHECKLIST

Este checklist documenta a validação do Aferix para uso real controlado (Field Trial), garantindo que os fluxos críticos estão operacionais e estáveis.

## 1. Fluxo Real de Uso (End-to-End)
Validar se o ciclo de vida do orçamento está íntegro:

- [ ] **Home:** Carregamento rápido e visibilidade das ações principais.
- [ ] **Novo Orçamento:** Abertura sem erros e salvamento inicial.
- [ ] **Cliente:** Seleção de cliente existente ou cadastro de novo sem travamentos.
- [ ] **Serviços:** Adição de itens, edição de quantidades e descrição.
- [ ] **Valores:** Cálculo automático de totais, impostos e margem de lucro.
- [ ] **Envio:** Geração de PDF/Visualização e simulação de envio ao cliente.
- [ ] **Aprovação:** Mudança de status para "Autorizado".
- [ ] **Execução:** Mudança de status para "Em Execução".
- [ ] **Finalização:** Conclusão do trabalho e registro de evidências/notas.
- [ ] **Arquivamento:** Movimentação para o histórico (Arquivado).
- [ ] **Financeiro:** Reflexo automático das receitas/despesas no módulo financeiro.

## 2. Checklist Manual (Mobile)
Testar especificamente a experiência em dispositivos móveis:

- [ ] **iPhone:** Renderização correta, safe areas respeitadas.
- [ ] **Android:** Comportamento do botão "Voltar" nativo e performance.
- [ ] **Teclado Aberto:** Inputs não ficam escondidos pelo teclado, scroll funciona com teclado ativo.
- [ ] **Scroll Longo:** Performance em listas longas de serviços ou clientes.
- [ ] **Orçamento Real:** Fluxo completo realizado em dispositivo físico sob luz do sol (legibilidade).
- [ ] **Arquivamento:** Feedback visual claro após arquivar.
- [ ] **Financeiro:** Facilidade de leitura de valores e gráficos em tela pequena.

## 3. Roteiro de Teste: 3 Orçamentos Reais

### Cenário A: Orçamento Simples
- **Objetivo:** Velocidade de criação.
- **Passos:** Novo -> Cliente Rápido -> 1 Serviço -> Enviar -> Aprovar -> Finalizar.
- [ ] Resultado: OK?

### Cenário B: Orçamento com Custos
- **Objetivo:** Validação de margem e lucro.
- **Passos:** Novo -> Cliente -> Itens com custo de material e mão de obra -> Validar Lucro -> Executar -> Finalizar.
- [ ] Resultado: OK?

### Cenário C: Ciclo Completo de Vida
- **Objetivo:** Testar transições de estado e persistência.
- **Passos:** Novo -> Pausar -> Retomar -> Recusar -> Reabrir -> Autorizar -> Finalizar -> Arquivar.
- [ ] Resultado: OK?

## 4. Validação Técnica (Automática)
Resultados da execução das ferramentas de qualidade:

- [x] **Lint:** `npm run lint` (Passou?)
- [x] **Typecheck:** `npm run typecheck` (Passou?)
- [x] **Build:** `npm run build` (Passou?)
- [x] **Unit Tests:** `npm run test` (Passou?)
- [x] **E2E Tests:** `npx playwright test` (Passou?)

## 5. Riscos Restantes
*Nenhum risco técnico identificado durante a validação automática. A aplicação está apta para uso real.*

---
**Decisão Final:**
- [x] Pronto para Teste Real Controlado
- [ ] Precisa de Ajustes Críticos
