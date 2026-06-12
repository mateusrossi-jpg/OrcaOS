# SPRINT: Modal Simplification (Workspace in Modal Eradication)

## 1. O Problema
A arquitetura do Aferix foi desenhada para ser um Sistema Operacional Mobile-First. Quando renderizamos Workspaces completos (páginas inteiras) dentro de componentes `<Modal>`, introduzimos severos problemas:
- **Impacto em Performance:** A renderização de duas árvores pesadas do DOM (A tela base e o Workspace do Modal) degrada o FPS, principalmente em dispositivos de baixo custo no campo.
- **Impacto em Memória:** Duplicação de listeners e instâncias de repositórios/services, aumentando drasticamente o uso da memória RAM (crash em aparelhos antigos).
- **Impacto em Ergonomia:** Problemas clássicos de *double-scrolling* no iOS/Android, fechamentos acidentais por clique fora da área, e interface "espremida" que dificulta o uso sob luz solar ou em movimento.

---

## 2. Auditoria e Casos Mapeados

### 2.1. BudgetForm + PremiumCatalogWorkspace 🚨 (Prioridade Máxima)
- **Localização:** `src/pages/BudgetForm.tsx` (Linha ~522).
- **Caso:** O componente `<PremiumCatalogWorkspace />` é injetado inteiro dentro de um `<Modal>` para que o usuário escolha itens para o orçamento.
- **Impacto:** O Catálogo já é uma tela complexa, com cards pesados, categorias e sistema de busca. Colocá-lo no modal destrói a ergonomia da tela.
- **Proposta de Migração (Step Interno):**
  - Mudar o fluxo para um modelo de "Telas/Steps". Ao invés de um modal, o estado `showCatalog` deve trocar o componente principal da view. O formulário do orçamento "some" (ou fica oculto por CSS/condicional) e a tela é tomada 100% pelo Catálogo adaptado para seleção (ex: modo `selectionMode`).

### 2.2. ClientsWorkspace (Dossiê do Cliente)
- **Localização:** `src/features/clients/components/ClientsWorkspace.tsx` (Linha ~354).
- **Caso:** Visualização dos detalhes do cliente (Dossiê) abre num Modal com rolagem imensa contendo gráficos e inputs.
- **Proposta de Migração (Bottom Sheet):**
  - Substituir o `<Modal>` por um `<BottomSheet>` (Drawer) com altura responsiva (ocupando 90% da tela), garantindo ancoragem na base e scroll fluido e nativo. 

### 2.3. OperationsHub (Checkout de OS)
- **Localização:** `src/features/clients/components/OperationsHubWorkspace.tsx` (Linhas ~326).
- **Caso:** Modal de "Checkout de Execução" com campos monetários e textarea de notas.
- **Proposta de Migração:**
  - Formulários que contêm inputs em dispositivos móveis, ao abrirem teclado dentro de Modais centralizados, quebram a rolagem e escondem os campos (iOS Keyboard Bug). A solução é migrar o fluxo de Checkout para um **Bottom Sheet** ou **Tela Dedicada (Fluxo Express)**.

---

## 3. Nova Diretriz Arquitetural (UX Mandate)

A partir da conclusão desta Sprint, fica decretado que:
1. **Modais Estritos:** O componente `<Modal>` será restrito para **ações destrutivas curtas** (ex: "Confirmar Exclusão") e **alertas simples**.
2. **Proibição de Workspaces em Modais:** Nenhum arquivo com a nomenclatura `*Workspace.tsx` pode ser montado dentro de um Modal.
3. **Uso de Bottom Sheets e In-Place Views:** Interfaces de seleção, formulários longos ou cruzamento de módulos (como Catálogo em Orçamento) devem utilizar substituição de componentes na tela (Internal Steps) ou componentes tipo Drawer (Bottom Sheet) firmemente ancorados no rodapé, permitindo manuseio total com o ergonomia (foco ergonômico).
