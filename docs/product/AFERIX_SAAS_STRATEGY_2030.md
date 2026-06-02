# AFERIX SAAS PORTFOLIO & PRICING STRATEGY 2030
**Status:** CONGELADO E RATIFICADO  
**Foco:** Monetização, Planos, Limites de Clientes e Add-ons Comerciais/Industriais  
**Métrica Estrela (North Star Metric):** MRR (Mensalidade Recorrente) & LTV (Lifetime Value) de Técnicos Ativos

---

## 🏛️ MODELO DE EMPACOTAMENTO SAAS
A **Aferix Platform** adota uma estratégia de empacotamento híbrida de **Assinatura baseada em Recursos (Resource-based SaaS)** combinada com **Módulos Adicionais (Add-ons)** específicos de nicho. Isso garante que o autônomo individual tenha barreiras mínimas de entrada, enquanto corporações de engenharia paguem taxas proporcionais ao valor extraído da plataforma.

```text
       ┌───────────────────────────────────────────────────┐
       │             ENTERPRISE PLAN                       │  ◄── Corporações Técnicas
       ├───────────────────────────────────────────────────┤
       │             TEAM PLAN                             │  ◄── Múltiplas Equipes
       ├───────────────────────────────────────────────────┤
       │             PRO PLAN                              │  ◄── PMEs de Climatização/Elétrica
       ├───────────────────────────────────────────────────┤
       │             STARTER PLAN                          │  ◄── Autônomos de Campo
       └───────────────────────────────────────────────────┘
               ▲                                   ▲
               │                                   │
      [ ADD-ON: OrçaOS Commercial ]       [ ADD-ON: ENDAP Connected ]
```

---

## 1. DETALHAMENTO DE PLANOS E LIMITES

### A. STARTER PLAN (O Plano do Autônomo)
* **Público-Alvo:** Profissionais autônomos individuais de campo (eletricistas, encanadores, técnicos de manutenção).
* **Preço Sugerido:** R$ 49,00 / mês (ou R$ 39,00/mês no faturamento anual).
* **Limites de Recursos:**
  * **Usuários:** Estritamente 1 assento (Owner-Operator).
  * **Workspaces:** Estritamente 1 Workspace pessoal local.
  * **Clientes Ativos:** Até 50 cadastros ativos.
  * **Ordens de Serviço:** Até 30 fechamentos de OS por mês.
  * **Ativos CMMS:** Até 100 ativos catalogados.
* **Módulos Disponíveis:** CRM operacional básico, Agenda local, Financeiro de campo simplificado (entradas/saídas) e checklists padrão.
* **Restrições:** Sem sincronização de equipes, sem multi-tenancy, sem dashboards corporativos, sem suporte a preventivas automatizadas (PMOC).

### B. PRO PLAN (O Plano do Prestador Regional)
* **Público-Alvo:** Pequenas empresas com equipes pequenas de técnicos dedicados de campo.
* **Preço Sugerido:** R$ 149,00 / mês base (inclui 2 assentos) + R$ 69,00 / técnico adicional / mês.
* **Limites de Recursos:**
  * **Usuários:** Até 10 assentos de colaboradores.
  * **Workspaces:** Até 3 Workspaces independentes (para filiais ou grandes clientes corporativos).
  * **Clientes Ativos:** Até 500 cadastros.
  * **Ordens de Serviço:** Ilimitadas.
  * **Ativos CMMS:** Até 1.000 ativos.
* **Módulos Disponíveis:** Todos do Starter + Programação de Preventivas Avançadas (Mapeamento PMOC Completo de checklists ANVISA), Coleta de fotos ilimitadas de evidências de OS e Assinatura Eletrônica integrada em campo.
* **Restrições:** Sem acesso à plataforma de automação e telemetria industrial complexa.

### C. TEAM PLAN (O Plano de Operação Multi-Filiais)
* **Público-Alvo:** Empresas consolidadas com múltiplos veículos de campo, despachadores dedicados e operação baseada em SLAs de contratos.
* **Preço Sugerido:** R$ 499,00 / mês base (inclui 5 assentos) + R$ 59,00 / técnico adicional / mês.
* **Limites de Recursos:**
  * **Usuários:** Até 50 assentos de colaboradores.
  * **Workspaces:** Até 10 Workspaces independentes.
  * **Clientes Ativos:** Até 2.500 cadastros.
  * **Ativos CMMS:** Até 5.000 ativos.
* **Módulos Disponíveis:** Todos do Pro + Relatórios Automatizados de SLA, Integração de Agenda por rotas inteligentes (Google Maps API), Painéis Avançados de Lucratividade Operacional e Centro de Despacho em lote (Bulk Dispatcher).
* **Restrições:** Sem suporte a telemetria em milissegundos dedicada ou compilação dedicada na nuvem.

### D. ENTERPRISE PLAN (A Solução Industrial e de Facilities)
* **Público-Alvo:** Grandes prestadoras de manutenção predial comercial, operadoras de shoppings e indústrias farmacêuticas com controle rígido de auditoria.
* **Preço Sugerido:** Sob consulta (mínimo contratual de R$ 2.500,00 / mês).
* **Limites de Recursos:**
  * **Usuários / Workspaces / Clientes:** 100% Ilimitados.
  * **Ativos CMMS:** Até 50.000 ativos monitorados.
* **Módulos Disponíveis:** Todos do Team + SSO Corporativo (SAML/ADFS), Exportador de Relatórios em Whitelabel, Logs de Auditoria de Segurança estendidos e Acordo de Nível de Serviço de Suporte técnico dedicado 24/7.

---

## 2. OS MÓDULOS ADICIONAIS (ADD-ONS DE SPOKES)
Para maximizar a expansão de receitas internas (Net Revenue Retention - NRR), a plataforma habilita add-ons opcionais que plugam os Spokes diretamente no Core:

### Add-on A: ORÇAOS COMMERCIAL PRO
* **O que habilita:** 
  * Construtor visual interativo de propostas comerciais de alta velocidade (Markup e taxas em tempo real).
  * Envio automatizado de links da proposta para aprovação do cliente via WhatsApp com assinatura digital simplificada integrada.
  * Catálogos dinâmicos integrados via API REST com preços de materiais de grandes atacadistas de climatização e elétrica regionais.
* **Preço Sugerido:** Adicional de R$ 79,00 / mês por vendedor/estimador ativo na conta.

### Add-on B: ENDAP TELEMETRY CONNECTED
* **O que habilita:**
  * Ingestão de sinais de telemetria física (sensores IoT) conectados diretamente no ENDAP.
  * Automação de chamados de preventivas baseadas no uso real dos equipamentos (ex: compressor rodou 500 horas, disparar OS de limpeza automática).
  * Painel de monitoramento SCADA industrial integrado no dashboard do Aferix.
* **Preço Sugerido:** Adicional de R$ 19,00 / mês por ativo monitorado em tempo real por telemetria IoT.

---

## 3. MECANISMO DE CONVERSÃO DE TRIAL EM CAMPO
* **14-Day Pro Trial:** O usuário cadastra-se na plataforma e recebe acesso imediato a todas as ferramentas (Aferix Pro, OrçaOS Comercial e calculadoras ENDAP).
* **Time-to-Value (TTV) Reduzido:** No primeiro login, a base Dexie é populada com templates ANVISA de PMOC e catálogos rápidos de climatização/elétrica para simulação em campo em menos de 1 minuto.
* **Fim do Trial:** O usuário escolhe seu plano base Aferix. Se desejar continuar gerando links elegantes de propostas, assina o add-on OrçaOS.
