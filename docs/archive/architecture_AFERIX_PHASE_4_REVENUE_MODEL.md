# AFERIX ERP PREMIUM — MODELO DE RECEITA E MONETIZAÇÃO (FASE 4)
`STATUS: VALIDADO | PAPEL: SAAS FOUNDER & REVENUE AUDITOR`
`ESTRATÉGIA FINANCEIRA: RECORRÊNCIA MENSAL (MRR) SUSTENTÁVEL`

Este documento apresenta a **Estratégia de Monetização e Precificação** estruturada para o Aferix ERP Premium. A precificação foi formulada de forma pragmática para equilibrar a conversão inicial com a rentabilidade necessária para arcar com os custos de infraestrutura em nuvem (Supabase DB, WebSockets e tráfego de dados de sincronização).

---

## 1. ANÁLISE DOS MODELOS DE MONETIZAÇÃO AVALIADOS

Avaliamos cinco modelos de monetização comercial durante o programa piloto:

| Modelo de Precificação | Taxa de Conversão | Impacto no Caixa | database sync / server cost | Veredito Estratégico |
| :--- | :---: | :---: | :---: | :--- |
| **Plano Gratuito (Freemium)**| Alta | Nenhum | Risco de estouro de quota | **REJEITADO** como plano aberto. Usado apenas como Trial de 14 dias. |
| **Licença Vitalícia (Lifetime)**| Altíssima Inicial | Ruim a Médio Prazo | **INSUPORTÁVEL** (Custo recorrente infinito) | **REJEITADO DEFINITIVAMENTE**. |
| **Assinatura Mensal** | **Alta** | **Excelente (MRR)** | **Sustentável** (Custo casado com a receita) | **APROVADO** (Modelo Primário). |
| **Assinatura Anual** | Média | Excelente Upfront | **Altamente Sustentável** | **APROVADO** (Desconto de 20% para fidelidade). |

---

## 2. DETALHE DA ESTRUTURA DOS PLANOS COMERCIAIS

Estabelecemos três níveis claros de planos de assinatura, desenhados especificamente para empresas de manutenção e climatização:

### A. Plano Aferix Starter (Teste de Adoção)
* **Preço:** R$ 0 (Limitado a 14 dias de teste completo).
* **Limitações:** Máximo de 1 usuário/técnico, 10 ativos cadastrados, 5 orçamentos por mês.
* **Foco:** Permitir que o gestor ou técnico independente execute um ciclo completo de PMOC e envie o primeiro orçamento em PDF antes de pagar.

### B. Plano Aferix Pro (Nicho Principal - Técnicos)
* **Preço:** R$ 89,00 / mês por assento de técnico (ou R$ 71,00 / mês se faturado anualmente).
* **Recursos Inclusos:**
  * Sincronização multi-dispositivo reativa offline-first ilimitada.
  * Cadastro ilimitado de ativos e clientes.
  * Geração automatizada do PMOC (PDF assinado nos moldes ANVISA/CREA).
  * Painel de acompanhamento de orçamentos e fluxo financeiro em tempo real.
  * Assinatura digital do cliente na tela do celular.

### C. Plano Aferix Enterprise (Grandes Facilities)
* **Preço:** A partir de R$ 599,00 / mês (Lotes de até 10 técnicos. Técnicos adicionais por R$ 59/mês).
* **Recursos Inclusos:**
  * Workspaces ilimitados para filiais distintas.
  * Checklists e relatórios PMOC customizados por grande cliente.
  * Canal prioritário de suporte do time de Customer Success.
  * Exportação consolidada de transações em Excel/CSV.

---

## 3. JUSTIFICATIVA ESTRUTURA CONTRA LICENÇAS VITALÍCIAS (LIFETIME)

Como engenheiros e fundadores SaaS, vetamos de forma rígida a oferta de licenças vitalícias no Aferix por motivos de sustentabilidade de infraestrutura:
1. **Custo de Sync Recorrente:** Cada transação de banco de dados executada em campo pelo técnico móvel gera consumo de transferência de dados (bandwidth), queries no banco relacional PostgreSQL, conexões WebSockets persistentes de realtime e armazenamento em nuvem no Supabase.
2. **Incompatibilidade Financeira:** Cobrar uma única vez por uma licença vitalícia e arcar com custos recorrentes mensais de servidores e APIs por 5 a 10 anos é um modelo insustentável que sufoca o fluxo de caixa, levando ao colapso do suporte ao cliente.
3. **Casamento de Custo e Receita:** A cobrança mensal por assento de técnico garante que o crescimento do custo de processamento na nuvem esteja 100% proporcional ao crescimento da receita de assinaturas recorrentes (MRR).

O modelo de Assinatura Recorrente Mensal/Anual garante a perpetuidade, evolução contínua e confiabilidade do ecossistema do Aferix ERP Premium.

---
`FIM DO MODELO DE RECEITA`
