# PLANO DE PARIDADE EXECUTIVA — AFERIX OS

**Status:** Planejamento Concluído
**Perfil:** UX/UI Engineer & Architect
**Objetivo:** Garantir que 100% do app, incluindo ferramentas de suporte, siga o padrão cinematográfico e a densidade executiva da Home.

---

### 1. MENU EXECUTIVO (Ajustes)
*   **Problema:** O Header do MenuScreen está duplicado quando entra em sub-seções.
*   **Melhoria:** Unificar o padrão de Header com o `AppHeader` do sistema.
*   **Densidade:** Implementar o `ExecutiveSummaryGrid` para mostrar o status da Licença e o uso de Armazenamento/Backup no topo.

### 2. CATÁLOGO PROFISSIONAL
*   **Problema:** A visualização de itens é uma lista simples sem inteligência de categoria visual.
*   **Melhoria:** Usar `InteractiveRow` e `SemanticBadge` para diferenciar Material de Mão de Obra instantaneamente.
*   **KPIs:** Adicionar um sumário executivo no topo mostrando "Total de Itens", "Margem Média" (se disponível) e "Última Atualização".

### 3. RELATÓRIOS E BI
*   **Problema:** É a aba mais densa e menos "visual".
*   **Melhoria:** Transformar as tabelas de relatório em `ListCard` com hierarquia de cores Aferix (Verde/Vermelho).
*   **Destaque:** O ROI do período deve ser o objeto central (Hero Balance).

---

### 4. CRONOGRAMA DE EXECUÇÃO

**PASSO 1: Refatoração do MenuScreen (Imediato)**
*   Padronizar navegação interna.
*   Injetar sumário de licença e segurança.

**PASSO 2: Refatoração do CatalogHub**
*   Aplicar o padrão de "Biblioteca Digital".
*   Melhorar o feedback visual de "Adicionado ao Orçamento".

**PASSO 3: Refatoração do ReportWorkspace**
*   Aplicar a "Lente de Lucratividade" em todos os indicadores.

---

### 5. VEREDITO DE DESIGN
Ao concluir este plano, o Aferix OS deixará de ter "pontas soltas". O usuário sentirá que está em um sistema único, do orçamento à configuração do backup.

---
**Próximo Passo:** Iniciar refatoração do `MenuScreen.tsx`.