# AFERIX — BACKLOG DO PRIMEIRO CLIENTE PAGANTE (PMOC MVP)
**Status:** CONGELADO E RATIFICADO  
**Objetivo:** Guiar a Implementação Semanal dos Ajustes de Código Focados em Monetização

---

## 📅 PLANEJAMENTO DE ROADMAP TÁTICO SEMANAL

Abaixo está o backlog operacional e detalhado de engenharia para o desenvolvimento do MVP de campo nos próximos 21 dias:

---

## 🔨 SEMANA 1 — BOOTSTRAP DE DADOS & ERGONOMIA MÓVEL DE CAMPO

### [T-P0-01] Carga de Dados no Primeiro Login
* **Descrição:** Pré-popular o IndexedDB (Dexie) com dados fictícios legíveis no bootstrap para evitar o estado "mudo e vazio" (Zero-friction onboarding).
* **Tarefa Técnica:** Adicionar método de sementes (seed data) no arquivo `src/storage/dexieDatabase.ts` que executa no bootstrap apenas se a contagem das tabelas for zero.
* **Insumos a Inserir:**
  * 1 Cliente Falso: "Edifício Comercial Paulista"
  * 1 Site Falso: "Matriz - Avenida Paulista, 1000"
  * 2 Ativos Falsos: "Ar Condicionado Split 30.000 BTU - Recepção" e "Chiller Principal - Cobertura"
  * 1 Ordem de Serviço PMOC ativa associada.

### [T-P0-02] Template de Checklist ANVISA Regulamentar
* **Descrição:** Pré-popular as tabelas de checklists com o checklist oficial ANVISA Portaria 3.523/98.
* **Tarefa Técnica:** Injetar na tabela Dexie de templates o array estruturado de itens de verificação (Filtro, Dreno, Serpentina, Duto, Bandeja de condensado, Motores/Gaxetas).

### [T-P0-03] Ajuste de Ergonomia Móvel
* **Descrição:** Garantir tamanho mínimo de área de toque de `44px x 44px` nos botões de checklist.
* **Tarefa Técnica:** Ajustar o espaçamento e padding no arquivo `src/styles/design-system.css` e assegurar que as marcações SIM/NÃO do checklist móvel sejam fáceis de operar com uma mão só no topo da escada.

---

## 🎨 SEMANA 2 — COMPONENTE DE CHECKLIST & CANVAS DE ASSINATURA

### [T-P0-04] Desenvolvimento do Painel de Checklists (ChecklistExecutionPanel)
* **Descrição:** Interface na UI para o técnico marcar os itens conformes/não conformes em lote.
* **Tarefa Técnica:** Criar o componente React `src/features/execution/components/ChecklistExecutionPanel.tsx`.
* **Regra de Negócio Crucial:** Adicionar o botão "Marcar todos como Conforme" (Bulk Compliant Trigger) para poupar o técnico de ter de clicar 12 vezes para cada um dos 100 aparelhos ar-condicionado.

### [T-P0-05] Desenvolvimento da Coleta de Assinatura Tátil (SignaturePad)
* **Descrição:** Canvas responsivo baseado em HTML5 para coleta física do rabisco do cliente na tela.
* **Tarefa Técnica:** Criar `src/app/components/ui/SignaturePad.tsx` ouvindo eventos `onTouchStart`, `onTouchMove` e `onTouchEnd`. Exportar para string Base64 compacta e gravar no campo `clientSignature` da Ordem de Serviço no Dexie.

---

## 📄 SEMANA 3 — GERADOR DE LAUDO PDF PMOC & COMPARTILHAMENTO WHATSAPP

### [T-P0-06] Desenvolvimento do PDF Técnico Padrão ANVISA (Laudo PMOC)
* **Descrição:** Motor de PDF no `@react-pdf/renderer` específico para inspeção técnica e vigilância sanitária.
* **Tarefa Técnica:** Criar `src/features/reports/components/PmocTechnicalReportPdf.tsx`.
* **Elementos Visuais Exigidos:**
  * Cabeçalho de identificação da Edificação (Razão Social, CNPJ, Endereço).
  * Tabela condensada em fonte high-density contendo a lista dos aparelhos, marca, localização, capacidade em BTUs e status dos itens de vistoria.
  * Imagem da assinatura eletrônica coletada renderizada no rodapé.
  * Espaço para assinatura técnica e digitação do CFT/CREA do responsável técnico.

### [T-P0-07] Acionador de Envio WhatsApp (WhatsApp Share Gateway)
* **Descrição:** Compartilhamento nativo da OS finalizada com link direto.
* **Tarefa Técnica:** Integrar no `ExecutionQuickActions.tsx` o botão "Enviar pelo WhatsApp". Utilizar a API `navigator.share` nos celulares suportados e fallback para `api.whatsapp.com/send?text=...` contendo mensagem comercial elegante e o link público do PDF hospedado.

### [T-P0-08] Bloqueio e Paywall Stripe Checkout
* **Descrição:** Bloquear o uso após 14 dias com tela OLED de faturamento.
* **Tarefa Técnica:** Validar no carregamento do app a data da conta (`created_at`). Se expirar o trial de 14 dias, exibir modal OLED irremovível com botão de link direto Stripe de assinatura Pro de R$ 89,00/mês ou PIX QR Code.
