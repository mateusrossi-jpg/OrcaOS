# AFERIX — PLANO DE EXECUÇÃO TÉCNICA (FIRST CUSTOMER MVP)
**Status:** UX EXECUTION MODE ACTIVE  
**Foco:** Engenharia Aplicada para Fechamento de Vendas em Campo  
**Data:** 01 de Junho de 2026

---

## 🏛️ ORDEM EXATA DE IMPLEMENTAÇÃO TÉCNICA

Para garantir que o fluxo de dados local-first seja respeitado e a usabilidade móvel em campo seja perfeita, as implementações seguirão a ordem sequencial abaixo:

```text
[ 1. DemoBootstrapService ] ──► Popula o banco local com o template ANVISA e dados fictícios
             │
             ▼
[ 2. ChecklistExecutionPanel ] ─► Permite preencher vistorias com toques rápidos (Bulk Compliant)
             │
             ▼
[ 3. SignaturePad ] ───────────► Coleta o rabisco tátil do cliente no check-out (Base64)
             │
             ▼
[ 4. PmocTechnicalReportPdf ] ──► Compila e gera localmente o laudo de preventiva em PDF
             │
             ▼
[ 5. WhatsApp Share ] ─────────► Dispara o link do laudo em 1 clique pelo WhatsApp
             │
             ▼
[ 6. Trial + Paywall ] ────────► Protege o SaaS travando o uso pós-14 dias com checkout Stripe
```

---

## 1. DETALHAMENTO DE ENGENHARIA POR ITEM

---

### ITEM 1 (P0): DemoBootstrapService.ts (Sementes de Banco)
* **Arquivos Impactados:**
  * Criar `src/services/DemoBootstrapService.ts`
  * Modificar `src/storage/dexieDatabase.ts` (para chamar o serviço no bootstrap se o banco estiver limpo).
* **Dependências:**
  * Repositórios do Dexie (`db.clients`, `db.assets`, `db.workOrders`, `db.assetExecutions`).
* **Critérios de Aceite:**
  1. No primeiro carregamento da conta, injeta automaticamente:
     * 1 Cliente: "Edifício Comercial Paulista" (Matriz).
     * 2 Ativos: "Split 12k BTU - Recepção" e "Condensador 30k BTU - CPD".
     * 1 Checklist mestre ANVISA (12 itens regulamentares).
     * 1 Ordem de Serviço PMOC em status de rascunho com 2 execuções vinculadas.
  2. A carga ocorre em menos de **10ms**, sem travamento de tela.
* **Estratégia de Testes:**
  * Teste unitário em Vitest importando `DemoBootstrapService`, limpando a base IndexedDB fictícia e verificando se a contagem de registros é exatamente populada.
* **Riscos:** Duplicar os dados falsos em múltiplos logins. *Mitigação:* Usar checagem inicial estrita `count() === 0` envelopada em uma transação síncrona Dexie.

---

### ITEM 2 (P0): ChecklistExecutionPanel.tsx (Interface de Checklist)
* **Arquivos Impactados:**
  * Criar `src/features/execution/components/ChecklistExecutionPanel.tsx`
  * Modificar `src/features/execution/components/ExecutionWorkspace.tsx`
* **Dependências:**
  * `src/domain/assetExecution.ts` (Tipos de conformidade e resultados).
* **Critérios de Aceite:**
  1. Renderização de botões grandes (`SIM` em verde OLED, `NÃO` em vermelho OLED e `N.A.` em cinza) com altura mínima de **44px** e toque livre de atritos.
  2. Adicionar botão fixo **"Marcar todos como Conforme"** (Bulk Compliant Trigger) no topo do card do ativo. O clique preenche instantaneamente todos os 12 itens do ar-condicionado como conformes.
  3. Atualização local síncrona imediata no Dexie a cada toque.
* **Estratégia de Testes:**
  * Simulação de cliques de toque em ambiente Playwright E2E e validação do objeto JSON persistido na tabela `assetExecutions` local.
* **Riscos:** Lentidão ao carregar múltiplos checklists em celulares com pouca RAM. *Mitigação:* Renderização sob demanda (virtualizada) dos itens do checklist utilizando lazy-loading.

---

### ITEM 3 (P0): SignaturePad.tsx (Coleta Tátil de Assinatura)
* **Arquivos Impactados:**
  * Criar `src/app/components/ui/SignaturePad.tsx`
  * Modificar `src/features/execution/components/ExecutionQuickActions.tsx` (para chamar a coleta de assinatura ao concluir a OS).
* **Dependências:**
  * Canvas HTML5, suporte a eventos touch móveis (`onTouchStart`, `onTouchMove`, `onTouchEnd`).
* **Critérios de Aceite:**
  1. Assinatura suave e fluida desenhada com o dedo na tela, sem atraso físico ou lag de traço.
  2. Botões claros de "Limpar" e "Confirmar" na barra lateral inferior.
  3. A confirmação compacta o desenho em string Base64 PNG e grava no registro de OS do Dexie local.
* **Estratégia de Testes:**
  * Testes manuais em simulador mobile (iOS Simulator / Android Emulator) arrastando o ponteiro e validando se o Base64 gerado é uma imagem PNG válida.
* **Riscos:** Eventos de touch conflitando com o scroll da tela do celular móvel. *Mitigação:* Chamar `e.preventDefault()` de forma defensiva dentro dos handlers de eventos de desenho no canvas.

---

### ITEM 4 (P0): PmocTechnicalReportPdf.tsx (Laudo ANVISA em PDF)
* **Arquivos Impactados:**
  * Criar `src/features/reports/components/PmocTechnicalReportPdf.tsx`
  * Modificar `src/features/reports/components/ReportWorkspace.tsx`
* **Dependências:**
  * `@react-pdf/renderer` (para compilação em background no cliente móvel).
* **Critérios de Aceite:**
  1. PDF formatado rigidamente no layout técnico de vigilância sanitária.
  2. Tabela condensada em fonte compacta (Inter/Roboto) listando os aparelhos, capacidade (BTUs) e as marcações de conformidade física do PMOC.
  3. Renderização nítida da imagem de assinatura digital do cliente final e campo para digitação do CRT/CREA do técnico.
* **Estratégia de Testes:**
  * Executar a compilação local e extrair o arquivo PDF em modo de teste automatizado Playwright, validando a integridade das tags de layout e o peso final do binário gerado.
* **Riscos:** Vazamento de memória (Memory leak) ao compilar PDFs com muitos dados no celular. *Mitigação:* Lazy loading estrito de fontes e destruição de instâncias de desenho após a exportação.

---

### ITEM 5 (P1): WhatsApp Share (Compartilhamento do Laudo)
* **Arquivos Impactados:**
  * Modificar `src/features/execution/components/ExecutionQuickActions.tsx`
* **Dependências:**
  * `navigator.share` (Web Share API) e fallback da URL de redirecionamento WhatsApp API.
* **Critérios de Aceite:**
  1. Exibir botão "Enviar pelo WhatsApp" em verde OLED brilhante após o encerramento com sucesso da OS.
  2. O clique lê o PDF gerado e dispara o fluxo nativo de compartilhamento.
  3. Fallback envia mensagem personalizada com link direto: *"Olá! Segue o laudo técnico do PMOC de ar-condicionado da vistoria deste mês concluída com sucesso: [Link PDF]"*.
* **Estratégia de Testes:**
  * Validar em Playwright se a URL montada de compartilhamento atinge a estrutura esperada de parâmetros.
* **Riscos:** Bloqueio de pop-up no navegador móvel. *Mitigação:* Executar a URL de envio estritamente sob eventos de clique síncronos disparados pelo usuário.

---

### ITEM 6 (P1): Trial + Paywall (Mecanismo SaaS Stripe)
* **Arquivos Impactados:**
  * Criar `src/app/screens/StoreScreen.tsx`
  * Modificar `src/app/App.tsx` (para interceptar acessos pós-14 dias).
* **Dependências:**
  * `platform_users.created_at` (Data de cadastro na nuvem ou IndexedDB).
* **Critérios de Aceite:**
  1. Se a diferença entre a data atual e a data de criação for superior a 14 dias, bloqueia a interface operacional do Aferix.
  2. Exibe tela irremovível OLED com a proposta de valor e o botão direcionando para o link Stripe Pro Checkout (mensal R$ 89,00) ou PIX.
  3. Após confirmação do pagamento (webhook do Stripe atualiza as flags de planos), a tela operacional é automaticamente desbloqueada.
* **Estratégia de Testes:**
  * Teste unitário manipulando a data local IndexedDB para D-15 do cadastro e verificando se a interface de Paywall bloqueia a navegação de forma estrita.
* **Riscos:** técnicos alterando a data do relógio do celular para tentar burlar o trial. *Mitigação:* A validação de data do trial utiliza o cabeçalho timestamp do servidor nas requisições de sincronismo do Supabase.
