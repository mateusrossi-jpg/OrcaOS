# AFERIX DAILY USE AUDIT
**Data da Auditoria:** 02 de Junho de 2026
**Metodologia:** Simulação de 8 horas de operação real por persona.

---

## 1. PERSONA: FIELD (Técnico em Campo)
*Cenário: Atender 4 ordens de serviço, registrar anomalias e coletar assinaturas sob sol e rede instável.*

### Observações de Uso:
- **Pontos Positivos:** O botão gigante "INICIAR SERVIÇO" na thumb-zone é perfeito para uso com uma mão. O scroll vertical único para checklist reduziu o erro de "esqueci de preencher a Etapa 2".
- **Atrito Encontrado:** Registrar uma anomalia exige abrir um BottomSheet. Se o técnico encontrar 10 anomalias (ex: um rack de TI todo bagunçado), o processo de "Abrir -> Preencher -> Salvar" repetido 10 vezes gera fadiga.
- **Função Órfã:** O botão "Ver Prontuário" na `ExecutionCockpit` abre a lista de ativos, mas não permite editar dados básicos do ativo caso o técnico perceba um erro de TAG no local sem sair do fluxo da OS.

---

## 2. PERSONA: SALES (Vendedor / Comercial)
*Cenário: Transformar as 4 anomalias do técnico em propostas comerciais e enviar para o WhatsApp do cliente.*

### Observações de Uso:
- **Pontos Positivos:** A "Revenue Inbox" (Dinheiro na Mesa) cria um senso de urgência excelente. Ver o LTV acumulado do cliente durante a proposta ajuda na negociação de descontos.
- **Atrito Encontrado:** O processo de precificação ainda é manual. O sistema não sugere "Preço Sugerido" baseado no histórico de propostas similares, obrigando o vendedor a lembrar ou consultar tabelas externas.
- **Excesso de Cliques:** Para enviar uma proposta, o vendedor precisa: Salvar -> Gerar PDF -> Abrir WhatsApp -> Colar Link. Deveria ser uma ação única de "Enviar Assinatura".

---

## 3. PERSONA: MANAGER (Gestor de Operações)
*Cenário: Monitorar 12 técnicos, reagir a atrasos de SLA e revisar a qualidade das OS finalizadas.*

### Observações de Uso:
- **Pontos Positivos:** A visão "Fogo na Rua" permite identificar rapidamente onde a operação travou. O "TeamWorkspace" centraliza bem a gestão de acessos.
- **Atrito Encontrado:** O Gestor não tem uma visão de "Carga de Trabalho" futura clara. Ele vê o hoje e o agora, mas planejar a próxima semana exige navegar cliente por cliente.
- **Menu Confuso:** O `Dispatch` e a `Agenda` às vezes se sobrepõem conceitualmente na cabeça do usuário.

---

## 4. PERSONA: OWNER (Dono da Empresa)
*Cenário: Analisar o faturamento do mês no aeroporto e aprovar um desconto crítico para não perder um contrato VIP.*

### Observações de Uso:
- **Pontos Positivos:** Leitura do dashboard executivo em menos de 5 segundos. Clareza total sobre o MRR em risco.
- **Atrito Encontrado:** O dashboard é estático. O Owner não consegue clicar no "MRR em Risco" e ver exatamente quais contratos estão vencendo ou quais clientes estão insatisfeitos sem navegar manualmente para o CRM.
- **Falta de Atalho:** O Owner frequentemente precisa ver a "Visão do Técnico" para entender um problema complexo, mas alternar perfis exige deslogar e logar (mesmo com o atalho de debug, na vida real isso é atrito).

---

## RANKING DE BLOQUEIOS (UX PRIORITIZATION)

### P0 — IMPEDE OPERAÇÃO ESCALÁVEL
1. **Sincronização de Conflitos (Cloud):** Se dois técnicos editarem a mesma OS simultaneamente, o sistema perde dados (Identificado no Cloud Audit anterior, reforçado aqui).
2. **Falta de "Bulk Save" para Anomalias:** Técnicos em campo desistem de registrar múltiplas falhas se o processo for lento/repetitivo.

### P1 — GERA ATRITO GRAVE
1. **Navegação do Owner (No Drill-down):** O dono vê o problema mas não consegue "tocar" nele para ver os detalhes com 1 clique.
2. **Envio de Proposta Fragmentado:** O Comercial perde muito tempo em processos manuais de PDF/Link/WhatsApp.

### P2 — REFINAMENTO / POLIMENTO
1. **Unificação de Agenda/Dispatch:** Clarificar a diferença visual entre "Minha Agenda" e "Agenda da Equipe".
2. **Busca Global:** Falta um campo de busca que encontre Clientes, OS e Ativos simultaneamente em qualquer tela.

---

## CONCLUSÃO DO AUDITOR
O Aferix é uma ferramenta extremamente poderosa para uso individual (`SOLO`) ou pequenos times. No entanto, para um dia de 8 horas em uma empresa estruturada, a interface começa a "pesar" pela falta de automações de fluxo (ex: Enviar proposta direto) e pela falta de profundidade nos dashboards (Drill-down). O sistema é visualmente nota 10, mas operacionalmente precisa de "atalhos de produtividade".
