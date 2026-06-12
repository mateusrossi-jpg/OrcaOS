# AFERIX ECOSYSTEM STRATEGY 2030
*O Futuro Tecnológico dos Serviços Técnicos Globais*

**Data:** 01 de Junho de 2026  
**Autores:** Chief Product Officer & Portfolio Strategist  
**Status:** PROPOSTA ESTRATÉGICA HOMOLOGADA PARA 2030

---

## 🏛️ A RECOMENDAÇÃO EXECUTIVA SUPREMA
Após profunda avaliação de modelos de portfólio, acoplamento de código e comportamento de mercado, o Conselho de Governança SaaS ratifica a:

> **OPÇÃO C — Aferix como ERP Principal + OrçaOS e ENDAP como Produtos Satélites**

### Por que a Opção C é a Única Arquitetura Superior Viável?
Tentar unificar todas as capacidades em um único produto monolítico (Opção B) ou separar as marcas de forma 100% independente sem sinergia de dados (Opção A) geraria sobrecarga tecnológica ou destruiria o valor do ecossistema. 

A Opção C equilibra perfeitamente **foco de experiência (UX)**, **desempenho local-first** e **potencial de monetização**, estruturando-se em um modelo "Hub & Spoke" (Núcleo e Satélites):

```text
       [ OrçaOS: Satélite Comercial ]
                      │ (API / Eventos)
                      ▼
[ Aferix ERP: Core Operacional & Financeiro (SSOT) ]
                      ▲
                      │ (API / Eventos)
       [ ENDAP: Satélite Técnico & IoT ]
```

---

## 1. FUNDAMENTAÇÃO DO MODELO HUB & SPOKE (OPÇÃO C)

### A. Segmentação de Persona e Ergonomia de UX
* **Aferix Core (O Técnico e o Gestor de Campo):** O usuário do Aferix está no topo de uma escada, no subsolo de um shopping ou dirigindo entre clientes. Ele precisa de uma aplicação mobile-first rápida, com botões gigantes, foco total em offline, preenchimento ágil de OS, checklists legais e assinaturas rápidas. Ele **não** quer ver diagramas de CLP Modbus ou listas gigantes de 100.000 insumos comerciais de fornecedores.
* **OrçaOS Spoke (O Vendedor / Estimador Comercial):** O usuário está no escritório ou em uma reunião de negócios. Ele opera em telas grandes (tablet/desktop) analisando markup, taxas de cartões, calculando margem de lucro real e montando propostas visuais premium para clientes corporativos. Ele precisa de alta conectividade e velocidade comercial.
* **ENDAP Spoke (O Engenheiro / Projetista Técnico):** O usuário é altamente especializado. Ele está calculando o dimensionamento térmico de um prédio, parametrizando um CLP ou depurando o firmware de um gateway IoT. Trata-se de uma tela técnica de engenharia de alta complexidade instrumental.

### B. Arquitetura de Software e Desempenho Local-First
* **Isolamento de Estado:** Manter diagramas físicos, telemetria de sensores Modbus e catálogos de fornecedores massivos dentro do banco IndexedDB (Dexie) local-first do Aferix degradaria instantaneamente a performance nos celulares simples dos técnicos de campo.
* **Redução de Superfície de Erros (Blast Radius):** Se o compilador de firmware do ENDAP falhar ou se uma lista de fornecedores externos do OrçaOS cair, a operação de campo do técnico no Aferix (OS, check-in e faturamento offline) continua rodando a 100% de performance, preservando a resiliência operacional da empresa prestadora.

---

## 2. O VOLANTE DE CRESCIMENTO SINÉRGICO (THE GROWTH FLYWHEEL)
A Opção C estabelece uma máquina de aquisição orgânica de clientes de baixíssimo custo (CAC próximo a zero):

```text
[ ENDAP: Calculadoras Grátis SEO ] ──► Traz tráfego de técnicos qualificados
           │ (Exporta Dimensionamento)
           ▼
[ OrçaOS: Estimador Comercial ] ──► Converte projetos em Propostas Premium
           │ (Exporta Proposta Aprovada)
           ▼
[ Aferix: ERP & Preventivas ] ──► Retém o cliente na operação recorrente (LTV)
```

1. **Atração (ENDAP):** Disponibilizamos calculadoras técnicas grátis no ENDAP (cálculo de carga térmica para climatização, bitola de cabos, bobinagem de motores) como iscas de SEO de alto volume. O profissional encontra o ENDAP no Google, resolve sua dor técnica em 30 segundos sem pagar nada e cadastra-se na plataforma.
2. **Ativação (OrçaOS):** Ao final do dimensionamento técnico no ENDAP, um botão oferece: *"Deseja transformar este projeto em um orçamento profissional e gerar a proposta comercial com 1 clique?"*. O profissional é direcionado ao OrçaOS, que precifica os componentes e gera uma proposta premium em link interativo para o cliente final aprovar.
3. **Monetização e Retenção (Aferix):** Quando a proposta é aprovada, o ecossistema notifica: *"Proposta aprovada! Deseja despachar o técnico para instalar e gerenciar o faturamento deste cliente?"*. O usuário entra no Aferix Pro, iniciando a cobrança mensal recorrente (SaaS) operacional e o controle de preventivas (PMOC).

---

## 3. MODELO DE MONETIZAÇÃO INTEGRADO (SAAS & ADD-ONS)
A estrutura Hub & Spoke permite precificar de forma cirúrgica com base na maturidade e no tamanho do cliente:

* **Plano Starter (Aferix Core):** Voltado ao autônomo individual. Controle básico de clientes, agenda, OS simples e controle de despesas/receitas locais. Preço acessível para capturar o mercado de cauda longa (ex: R$ 49/mês).
* **Plano Professional / Team (Aferix + Workspaces):** Introduz o controle de equipes, equipes de campo, checklists operacionais regulamentares e controle financeiro avançado centralizado por filial. Preço por técnico ativo (ex: R$ 89/técnico/mês).
* **Add-on Comercial (OrçaOS Engine):** Faturamento adicional para empresas com equipe dedicada de vendas. Habilita o construtor visual de propostas interativas sob marca própria (White-label), catálogos integrados de fornecedores por API e acompanhamento de pipeline comercial.
* **Add-on Industrial / Automação (ENDAP Integration):** Faturamento premium baseado em conectividade. Habilita a telemetria de sensores de máquinas diretamente conectados na nuvem do ENDAP, que geram chamados preditivos automáticos no Aferix. Faturamento por ativo conectado (ex: R$ 15/ativo conectado/mês).

---

## 4. DIRETRIZES DE ROADMAP ATÉ 2030

### Fase I — Consolidação do Aferix Core (2026 - 2027)
* Finalizar a blindagem offline-first e sincronização RLS por sequência do Aferix ERP.
* Consolidar os motores operacionais (OS, Ativos, Sites, PMOC Local IndexedDB).
* Remover completamente qualquer resquício de calculadoras técnicas e catalogação complexa fora do Core de orçamentação básica do Aferix.

### Fase II — Lançamento do OrçaOS Spoke (2027 - 2028)
* Desenvolver a API REST de conexão comercial.
* Construir a plataforma desktop do OrçaOS com integração ativa a distribuidores de climatização e elétrica para busca automatizada de preços de insumos.
* Lançar a interface de propostas comerciais web interativas com aceite digital simplificado.

### Fase III — Lançamento do ENDAP Spoke e Conectividade IoT (2028 - 2030)
* Desenvolver os utilitários de cálculo de dimensionamento técnico para aquisição de tráfego (SEO).
* Construir os gateways HTTP/MQTT do ENDAP para processamento assíncrono de telemetria física.
* Integrar o motor de inteligência técnica do ENDAP para disparar preventivas inteligentes (manutenção baseada na condição do ativo) no Aferix.
