# AFERIX ERP PREMIUM — QUADRO DE EXECUÇÃO DE 90 DIAS (FASE 5.1)
`STATUS: ATIVO | PAPEL: CEO & PRODUCT STRATEGIST`
`DIRETRIZ DE OPERAÇÃO: FOCUS LOCK ATIVO | CONGELAMENTO DE ESCOPO`

Este documento consolida o **Quadro de Execução e Kanban de Prioridades de 90 Dias** do Aferix ERP Premium. Sob a diretriz rígida de **Focus Lock**, todas as discussões de expansão para outros nichos estão suspensas, canalizando toda a capacidade de engenharia e crescimento no auto-provisionamento para Climatização e PMOC.

---

## 1. QUADRO KANBAN DE TAREFAS PRIORITÁRIAS

Estabelecemos o cronograma tático de prioridades em blocos estruturados:

### A. PRIORIDADE P0 (Dias 1 a 30): Automação PLG Total (Self-Service)
* [ ] **T-P0-01: Auto-Signup Supabase Auth:** Configurar o formulário público com auto-geração de UUIDs de `companyId` nos metadados do JWT.
* [ ] **T-P0-02: Auto-Onboarding PWA:** Implementar assistente interativo integrado (Wizard) guiando o usuário na criação do primeiro Cliente e Importação de Ativos.
* [ ] **T-P0-03: Trial 14 dias com Block Gate:** Implementar bloqueio elástico de recursos após a expiração no IndexedDB local e no Supabase.
* [ ] **T-P0-04: Stripe Self-Service Billing:** Integrar Stripe Checkout nas configurações do PWA para compra de assentos Pro de técnicos de forma autônoma.
* [ ] **T-P0-05: Convite de Técnicos por E-mail:** Permitir ao gestor cadastrar técnicos enviando link de convite automático associado à sua `companyId`.
* [ ] **T-P0-06: Pre-loaded PMOC Templates:** Pré-popular o banco Dexie local com o checklist regulamentar ANVISA no primeiro login.

---

### B. PRIORIDADE P1 (Dias 31 a 60): Motor de Indicação (K-Factor)
* [ ] **T-P1-01: Member-get-Member Button:** Adicionar botão proeminente de "Ganhe 1 Mês Grátis Indicando um Amigo" no PWA.
* [ ] **T-P1-02: Referral Link Generator:** Motor de geração de chaves únicas de indicação criptografadas salvando relacionamento de origem.
* [ ] **T-P1-03: Referral Metrics Event Store:** Gravar no `operationalEvents` local as ações de convites enviados, convites aceitos e conversões de indicação pagas para auditoria de crescimento.

---

### C. PRIORIDADE P2 (Dias 61 a 90): Dashboard Executivo de Crescimento
* [ ] **T-P2-01: Administrative Metrics Collector:** Script Postgres na nuvem rodando consultas cron semanais agregadas para monitorar a base de inquilinos.
* [ ] **T-P2-02: Growth Dashboard UI:** Tela administrativa restrita ao CEO/Growth Lead exibindo os indicadores fundamentais de MRR, Churn, Conversão e Retenção.

---

## 2. POLÍTICA DE FOCUS LOCK CONGELADA (DIRETRIZ DE ESCOPO)

Para assegurar estabilidade operacional e foco extremo na meta de **R$ 15.000+ de MRR**, ficam terminantemente **PROIBIDOS E CONGELADOS** pelas próximas 12 semanas:
1. **Nenhum Novo Módulo ERP:** Sem expansões de faturamento fiscal complexo (NF-e/NFS-e nativo), sem controle de RH ou módulo de compras e estoque industrial.
2. **Nenhuma Nova Profissão:** Sem customizações para pintores, encanadores, mecânicos automotivos ou pintores. Foco é climatização comercial.
3. **Nenhum Redesenho de Arquitetura:** Sem migrações de frameworks, sem introdução de CQRS de alta complexidade ou novos wrappers de banco.
4. **Nenhum Novo Nicho:** Rejeitar prospecções de facilities corporativas multinacionais que exijam desenvolvimentos sob demanda.

O foco exclusivo no preenchimento automatizado e sem esforço de checklists de PMOC é a única fonte da receita recorrente escalar do Aferix.

---
`FIM DO QUADRO DE EXECUÇÃO`
