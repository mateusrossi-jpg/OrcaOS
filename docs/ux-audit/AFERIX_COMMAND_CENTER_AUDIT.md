# AFERIX COMMAND CENTER AUDIT
**Status:** UX Execution Mode | **Target:** Global Navigation & IA

## Objetivo
Eliminar a "Sopa de Módulos" do menu principal (Sidebar/Bottom Bar). Reduzir a carga cognitiva agrupando as funcionalidades pela Frequência de Uso e relevância de acordo com a Role do usuário.

## 1. Classificação das Funcionalidades

### A. USO DIÁRIO (The Core - O que não pode ficar escondido)
*Acesso em 1 clique.*
- **Field:** Home (Agenda do dia), Ordem de Serviço Ativa.
- **Sales:** Pipeline, Propostas.
- **Manager:** Command Center (Dashboard OS), Dispatch (Agenda Geral).
- **Owner:** Cockpit de Receita.

### B. USO SEMANAL (The Support - Visão secundária)
*Acesso no Menu Secundário.*
- **Global:** CRM (Clientes), Locais, Ativos.
- **Manager:** Controle de Qualidade, Compras pendentes.

### C. USO MENSAL (The Analytics)
*Relatórios de fim de ciclo.*
- **Manager/Owner:** Faturamento, Relatório PMOC, Fechamento de MRR.

### D. CONFIGURAÇÃO & ADMINISTRAÇÃO (The Settings)
*Escondido na engrenagem ou perfil.*
- Perfis de acesso, customização de checklists, templates de contrato, impostos, logos.

## 2. Reestruturação do Sidebar (Desktop) / Bottom Bar (Mobile)

### Mobile Bottom Bar (Max 4 ou 5 itens)
- **Field:** Agenda | OS Atual | Histórico | Perfil
- **Manager:** Dashboard | Dispatch | Aprovações | Mais (...)

### Desktop Sidebar (Aferix Premium)
Em vez de listar 20 entidades (Clientes, Ativos, OS, etc.), usar **Grupos de Intenção**:

**1. Operações (Execução)**
   - Dispatch
   - Ordens de Serviço
   - Controle de Qualidade

**2. Comercial (Receita)**
   - Pipeline de Propostas
   - Contratos
   - Anomalias Triadas

**3. Base (Estrutura)**
   - Clientes (Agrupa Locais e Ativos lá dentro - Drill down)
   - Estoque & Compras

**4. Gestão**
   - Dashboard
   - Relatórios

## 3. Diretriz UX (O "Anti-ERP")
Se um módulo só serve para alimentar um select (ex: "Tipos de Falha" ou "Marcas de Equipamento"), ele NÃO DEVE estar no menu lateral principal. Deve estar em `Configurações > Parâmetros do Sistema`.
O menu lateral é para "Trabalho", não para "Cadastro".
