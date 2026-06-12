# AFERIX ERP PREMIUM — PLANO DE VALIDAÇÃO DE MERCADO (FASE 4)
`STATUS: PLANEJADO | PAPEL: PRODUCT OWNER, SAAS FOUNDER & CUSTOMER SUCCESS LEAD`
`VEREDITO DO PROGRAMA: GO FOR PILOT`

Este documento estabelece o **Plano de Validação de Mercado (Fase 4)** para o Aferix ERP Premium, com foco em provar a atração comercial, usabilidade em campo real, monetização e retenção, transformando a robustez tecnológica em um negócio sustentável.

---

## 1. DEFINIÇÃO RIGOROSA DO CLIENTE IDEAL (ICP)

Após avaliar diversos segmentos de prestação de serviços no Brasil, selecionamos **UM NICHO INICIAL** altamente focado para a validação comercial rápida.

### A. Tabela Comparativa de Segmentos

| Segmento | Dor Operacional | Frequência de Uso | Ticket Médio | Custo de Aquisição (CAC) | Potencial de Retenção |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Eletricistas Autônomos** | Baixa (Uso de papel ou WhatsApp) | Média | Baixo (R$ 30/mês) | Alto | Baixo (Churn alto) |
| **Facilities Gerais** | Média (Processos corporativos) | Alta | Alto | Muito Alto (Enterprise) | Alto |
| **Técnicos PMOC / Climatização** | **Altíssima (Exigência Legal)** | **Alta (Mensal)** | **Médio-Alto (R$ 90/técnico)** | **Baixo-Médio (Nicho Focado)** | **Altíssimo (Contratos Anuais)** |

### B. O Vencedor do Nicho Inicial: Climatização & Técnicos PMOC
Decidimos focar **100% nas Empresas de Climatização e Técnicos Independentes de PMOC (Plano de Manutenção, Operação e Controle)**.

#### Justificativa Estratégica:
1. **Dor Legal Altíssima:** A Lei Federal 13.589/2018 exige que qualquer edifício de uso público ou coletivo com carga térmica igual ou superior a 60.000 BTUs possua um PMOC assinado por um engenheiro ou técnico registrado (CREA/CFT). Os técnicos passam de **30% a 40% do tempo de serviço preenchendo checklists manuais em papel** e compilando relatórios mensais em PDF para os clientes e fiscais da Vigilância Sanitária (ANVISA).
2. **Frequência de Uso Recorrente:** O PMOC exige visitas mensais preventivas obrigatórias para cada ar-condicionado. Isso força o uso diário do aplicativo móvel em campo pelo técnico.
3. **Alto Potencial de Retenção:** Uma vez que as ordens de serviço preventivas mensais e o histórico dos ativos estão consolidados no banco de dados local IndexedDB/Supabase do Aferix, a barreira de saída da empresa é altíssima.
4. **Facilidade de Aquisição:** Comunidades e fóruns online de instaladores de ar-condicionado (Gree, Daikin, LG) e canais do YouTube formam canais orgânicos de distribuição baratos e de alta conversão.

---

## 2. A QUISIÇÃO DOS PRIMEIROS CLIENTES PILOTO (COHORTE INICIAL)

Mapeamos a aquisição inicial de **10 empresas reais** atuantes no nicho de climatização para conduzir o ensaio comercial do piloto de validação:

| ID | Nome do Cliente Piloto | Técnicos | OS/mês | Ativos Cadastrados | Orçamentos/mês |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **01** | *ClimaTech Refrigeração* | 3 | 120 | 320 | 12 |
| **02** | *SuperAir Engenharia Térmica* | 2 | 80 | 180 | 8 |
| **03** | *Dantas Climatização Comercial* | 5 | 220 | 650 | 25 |
| **04** | *Frioclim Soluções* | 1 | 35 | 90 | 5 |
| **05** | *Vento Sul Manutenção Preventiva*| 4 | 160 | 410 | 18 |
| **06** | *Daikin Parcerias - Assistência*  | 2 | 90 | 220 | 10 |
| **07** | *Engenharia do Frio Piauí* | 3 | 110 | 300 | 14 |
| **08** | *FrioMax Soluções Térmicas* | 6 | 280 | 780 | 30 |
| **09** | *Refrigeração São Paulo Ltda* | 2 | 75 | 160 | 6 |
| **10** | *ClimaService Nordeste* | 8 | 400 | 1.100 | 45 |

---

## 3. CHECKLIST DOS EVENTOS DE VALIDAÇÃO OPERACIONAL

O time de Customer Success acompanhará e auditará os seguintes momentos-chave na jornada do cliente:

* [ ] **1. Primeiro login real:** Acesso inicial do gestor da empresa no aplicativo web/móvel.
* [ ] **2. Primeiro cliente cadastrado:** O gestor cadastra o primeiro cliente corporativo (ex: uma agência bancária ou shopping).
* [ ] **3. Primeiro atendimento:** Criação de um registro de visita ou chamado técnico em campo.
* [ ] **4. Primeiro orçamento:** Geração e preenchimento de proposta comercial.
* [ ] **5. Primeiro orçamento aprovado:** Cliente final autoriza e altera o status para `Autorizado` gerando a OS automaticamente.
* [ ] **6. Primeira OS executada:** Técnico conclui o preenchimento do checklist e assina digitalmente a ordem de serviço.
* [ ] **7. Primeiro faturamento registrado:** Registro de transação financeira atômica associada à OS concluída.
* [ ] **8. Primeiro PMOC executado:** Geração e execução massiva de checklists multi-ativos em lote com sucesso.
* [ ] **9. Primeira sincronização multi-dispositivo real:** Técnico atualiza no offline e o coordenador visualiza no escritório online.
* [ ] **10. Primeiro usuário recorrente:** Usuário que atinge 14 dias de uso ininterrupto completando fluxos comerciais.

---

## 4. METRICAS SAAS DE PILOTO (AARRR FRAMEWORK)

Mapearemos a tração do produto através das seguintes métricas semanais:

```text
  AQUISIÇÃO   --->  [Usuários Convidados vs. Usuários Ativos em Campo]
      |
  ATIVAÇÃO    --->  [Time-to-First-OS (Meta: < 3 dias) | Time-to-First-Budget]
      |
 ENGAJAMENTO  --->  [Frequência: OS/semana e Atendimentos/semana por técnico]
      |
  RETENÇÃO    --->  [Cohort Day 7 (Meta: > 60%) | Cohort Day 30 (Meta: > 45%)]
      |
  RECEITA     --->  [Assinantes Pagantes | MRR (Recorrência Mensal) | LTV]
```

Estas métricas consolidarão as evidências empíricas de que o produto resolve uma dor de mercado insubstituível.

---
`FIM DO PLANO DE VALIDAÇÃO`
