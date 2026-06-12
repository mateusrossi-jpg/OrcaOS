# AFERIX — AUDITORIA DE PRIMEIRA RECEITA (REVENUE CRITICAL PATH)
**Data:** 01 de Junho de 2026  
**Foco:** Lançamento do MVP Comercial e Monetização de Campo em 30 Dias  
**Status:** HOMOLOGADO E CONGELADO

---

## ETAPA 1 — INVENTÁRIO E CLASSIFICAÇÃO DE FUNCIONALIDADES
Para colocar dinheiro em caixa nos próximos 30 dias, toda a complexidade arquitetural futura é suspensa. Classificamos todas as funcionalidades operacionais sob o prisma absoluto da venda: **"Se removermos isso, o técnico deixa de pagar?"**

### 🚨 P0: Indispensável para Venda (Sem isso, ZERO vendas)
1. **Cadastro Offline-First de Clientes, Sites e Ativos:** O técnico precisa registrar o cliente e os aparelhos de ar-condicionado na escada, sem depender de internet.
2. **Preenchimento de Checklists de Preventiva (PMOC):** O técnico preenche a vistoria mensal de climatização selecionando itens conformes/não conformes com um toque.
3. **Template de Checklist Padrão ANVISA (Pré-carregado):** O usuário não pode iniciar com um app vazio. Os checklists de manutenção da Vigilância Sanitária devem aparecer prontos no primeiro login.
4. **Gerador Local de Laudo PMOC em PDF:** Emissão instantânea em campo de um PDF profissional contendo o relatório de conformidade de todos os aparelhos de ar-condicionado, com logomarca do prestador e campo para CREA/CFT do Responsável Técnico.
5. **Assinatura Digital em Campo:** Coleta na tela do celular da assinatura do cliente final comprovando a execução do serviço mensal.
6. **Backup Automático na Nuvem (Dexie -> Supabase Sync):** Garantia absoluta de que, se o técnico perder o celular, os dados históricos de conformidade de seus clientes (que evitam multas de R$ 1.500.000 da Vigilância Sanitária) estão seguros em nuvem.
7. **Gateway de Cobrança e Paywall (Stripe Checkout / Pix QR Code):** Tela simples de bloqueio pós-trial de 14 dias com link de pagamento recorrente.

### 📋 P1: Importante (Adiciona alto valor, mas dá para contornar no D1)
8. **Motor de Orçamentos e Margem Real (Profit Engine):** Excelente ferramenta de precificação de propostas, mas secundária em relação à urgência fiscal e regulamentar do PMOC.
9. **Agenda Operacional:** Calendário interno de visitas para técnicos. (Dá para contornar temporariamente usando Google Agenda comercial).
10. **Lançamento de Despesas Operacionais de Campo:** Controle de custos com combustível e alimentação durante a OS.

### 📂 P2: Opcional (Fica para o pós-receita)
11. **Múltiplos Workspaces por Usuário:** Separação lógica de filiais (para o autônomo e pequena empresa inicial, 1 workspace padrão resolve).
12. **Catálogos de Insumos Integrados por API:** Conexão com preços de distribuidores de hardware (técnicos de PMOC costumam usar tabelas fixas).
13. **Painel Avançado de Lucratividade EBITDA:** Gráficos corporativos complexos.

### 🛑 P3: Distração Absoluta (PROIBIDO tocar nos próximos 30 dias)
14. **Inteligência Artificial (IA) / Assistentes:** Chatbots técnicos ou consultores inteligentes de precificação.
15. **Integração Modbus / IoT de Telemetria:** Polling de dados de sensores ou automação residencial física.
16. **Marketplace de Peças / Extensões:** Loja para compra de insumos de fabricantes.
17. **Controle Avançado de Equipes com RBAC Complexo:** Níveis complexos de permissões (um login administrativo e logins idênticos de leitura/escrita para técnicos é suficiente para o MVP).

---

## ETAPA 2 — DEFINIÇÃO E JUSTIFICATIVA DO ICP INICIAL

Fica decretado de forma definitiva que o ICP Único para o primeiro cliente pagante é:

> **Empresas Regionais de Climatização (HVAC) com 2 a 5 técnicos de campo que gerenciam contratos recorrentes de PMOC.**

### Justificativa de Tração Comercial (Por que Climatização & PMOC e não outros?):

1. **A Dor Mais Aguda do Mercado (Forte Ameaça de Multa):**
   A Lei Federal 13.589/2018 exige que todo edifício de uso público e coletivo possua um Plano de Manutenção, Operação e Controle (PMOC) para ar-condicionado. A ausência de laudos e checklists mensais assinados gera multas da Vigilância Sanitária que variam de **R$ 2.000,00 a R$ 1.500.000,00**. O cliente do técnico de climatização exige esse relatório sob pena de rescisão contratual imediata.
   
2. **A Burocracia Noturna (A Dor de Cabeça do Dono):**
   Nas pequenas empresas de HVAC (2 a 5 técnicos), os técnicos preenchem planilhas amassadas de papel em campo. À noite, o proprietário (que também atua em campo) passa de 3 a 4 horas digitando esses relatórios em Word ou Excel no computador para converter em PDF e enviar aos clientes. Eles são extremamente propensos a pagar R$ 89,00 por técnico para eliminar essa digitação burocrática noturna.
   
3. **Receita Altamente Recorrente e Previsível:**
   Contratos PMOC são retentores mensais recorrentes (as empresas pagam de R$ 300,00 a R$ 3.000,00/mês para a prestadora HVAC). A prestadora possui fluxo de caixa garantido e capacidade de investimento imediata no Aferix.
   
4. **Ciclo de Vendas Curto (Dono de Campo):**
   Ao contrário de grandes corporações de engenharia (Facilities) que exigem 6 meses de reuniões, análises tributárias e compliance de TI, o proprietário da PME de HVAC toma a decisão de compra no celular em **5 minutos** após ver o primeiro PDF do PMOC gerado com sua própria logomarca.
