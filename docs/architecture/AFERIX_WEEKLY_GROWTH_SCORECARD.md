# AFERIX ERP PREMIUM — SCORECARD SEMANAL DE CRESCIMENTO (FASE 5.1)
`STATUS: CONTEXTO ADMINISTRATIVO ATIVO | PAPEL: REVENUE OPERATOR & SaaS GROWTH LEAD`
`DIRETRIZ DE MÉTRICA: RELATÓRIO DE PERFORMANCE SEMANAL (BOARD REPORT)`

Este documento apresenta a planilha de **Acompanhamento Executivo de Crescimento Semanal** do Aferix ERP Premium. O painel é alimentado todas as segundas-feiras via consultas agregadas em nuvem para monitorar a progressão rumo à meta de R$ 15.000+ MRR.

---

## 1. PAINEL EXECUTIVO DE DADOS SEMANAIS (TEMPLATE DE ACOMPANHAMENTO)

Abaixo estruturamos a planilha de métricas contendo as metas de expansão do coorte piloto para as próximas 12 semanas de Focus Lock:

| Semana | Empresas Pagantes | Técnicos Ativos (Seats) | Novos Cadastros (Trial) | Conversão Trial $\rightarrow$ Pro (%) | MRR Acumulado (R$) | Churn Mensal (%) | Retenção D30 (%) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Meta 90d**| **55** | **175** | **150+** | **30%** | **R$ 15.575,00** | **< 2.5%** | **> 70%** |
| **W01 (Atual)**| 3 | 10 | 8 | 30% | R$ 890,00 | 0.0% | 74% |
| **W02** | 5 | 16 | 12 | 30% | R$ 1.424,00 | 0.0% | 74% |
| **W03** | 8 | 25 | 18 | 31% | R$ 2.225,00 | 0.0% | 74% |
| **W04** | 12 | 38 | 24 | 30% | R$ 3.382,00 | 1.8% | 73% |
| **W05** | 17 | 54 | 30 | 31% | R$ 4.806,00 | 2.0% | 73% |
| **W06** | 22 | 70 | 38 | 32% | R$ 6.230,00 | 2.1% | 72% |
| **W07** | 28 | 90 | 45 | 30% | R$ 8.010,00 | 2.1% | 73% |
| **W08** | 34 | 108 | 52 | 31% | R$ 9.612,00 | 2.2% | 72% |
| **W09** | 40 | 127 | 60 | 31% | R$ 11.303,00 | 2.3% | 71% |
| **W10** | 45 | 143 | 68 | 30% | R$ 12.727,00 | 2.3% | 72% |
| **W11** | 50 | 159 | 75 | 31% | R$ 14.151,00 | 2.4% | 71% |
| **W12** | 55 | 175 | 85 | 30% | R$ 15.575,00 | 2.4% | 71% |

---

## 2. DICIONÁRIO E FÓRMULA DE MÉTRICAS OPERACIONAIS

Para manter a integridade dos relatórios executivos apresentados aos investidores e fundadores, definimos as seguintes regras de cálculo:

1. **Assentos Ativos (Seats):** Contagem física de registros na tabela `professionalProfiles` que possuem relacionamento ativo de cobrança Stripe com `syncStatus = 'synced'`.
2. **Taxa de Conversão Trial $\rightarrow$ Pro:**
   $$\text{Conversão} = \frac{\text{Contas que assinaram Pro na semana}}{\text{Contas cujos trials de 14d expiraram na semana}} \times 100$$
3. **Churn Mensal (Logo Churn):**
   $$\text{Churn} = \frac{\text{Empresas canceladas no mês}}{\text{Empresas ativas no início do mês}} \times 100$$
4. **Retenção D30 (Engajamento de Técnicos):** Percentual de usuários que executaram ao menos 1 checklist ou OS nos últimos 7 dias, contados exatamente 30 dias após o seu cadastro inicial no PWA.

---
`FIM DO SCORECARD DE CRESCIMENTO`
