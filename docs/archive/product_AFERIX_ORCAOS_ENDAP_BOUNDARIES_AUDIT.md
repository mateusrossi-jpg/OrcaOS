# AFERIX, ORÇAOS & ENDAP — AUDITORIA DE FRONTEIRAS DE PRODUTO
**Data:** 01 de Junho de 2026  
**Autores:** Chief Product Officer, Enterprise Architect, Portfolio Strategist & SaaS Governance Board  
**Status:** HOMOLOGADO E CONGELADO

---

##  EXECUTIVE SUMMARY
Esta auditoria foi instaurada pelo Conselho de Governança SaaS para resolver de forma definitiva as sobreposições de escopo, redundâncias de desenvolvimento e indefinições de arquitetura entre **Aferix**, **OrçaOS** e **ENDAP**. 

Para assegurar eficiência operacional máxima e evitar "feature creep" (diluição de foco), o ecossistema é segregado em três fronteiras funcionais estritas, mantendo a simplicidade local-first de cada produto enquanto se maximiza a interoperabilidade por APIs.

---

## ETAPA 1 — INVENTÁRIO DE CAPACIDADES DO ECOSSISTEMA
Mapeamento exaustivo de todas as capacidades funcionais demandadas por empresas e profissionais de serviços técnicos:

### A. Capacidades Operacionais & ERP (Aferix Core)
1. **CRM & Clientes:** Gestão de cadastros de clientes, históricos e inteligência de relacionamento.
2. **Sites:** Mapeamento geográfico de filiais, locais de instalação e pontos de atendimento de campo.
3. **Ativos (CMMS/EAM):** Cadastro de equipamentos, ciclo de vida de ativos e rastreabilidade de manutenção.
4. **Contratos:** Gestão de contratos de manutenção recorrente, SLAs de atendimento e regras de cobrança.
5. **Atendimentos:** Abertura de chamados, triagem de solicitações e despacho ágil de equipes.
6. **Ordens de Serviço (OS):** Controle determinístico de execução de campo, comprovação física e check-in/check-out.
7. **Checklists Operacionais:** Formulários dinâmicos de vistoria e rotinas de manutenção preenchidas pelo técnico.
8. **Relatórios de Campo:** Emissão de laudos de execução física e relatórios de conformidade.
9. **Assinaturas Digitais:** Coleta de assinaturas do cliente final em campo via tela do celular técnico.
10. **Agenda & Escalas:** Planejamento de alocação de técnicos, rotas geográficas e calendário integrado.
11. **Financeiro Operacional:** Fluxo de caixa de campo, lançamentos de despesas de OS, faturamento de contratos.
12. **Indicadores de Performance:** Métricas de produtividade das equipes, SLA atingido e custos operacionais.

### B. Capacidades Comerciais & Precificação (OrçaOS Engine)
13. **Orçamentos Complexos:** Motor de estimativa de materiais, horas de mão de obra e serviços adicionais.
14. **Calculadoras Financeiras:** Motor de Markup, cálculo automático de impostos, taxas de maquininha de cartão e margem de lucro real.
15. **Propostas Interativas:** Construtor visual de propostas comerciais (links web dinâmicos) para aceitação do cliente.
16. **Catálogo Unificado:** Cadastro global de materiais, insumos de fornecedores e precificação de referência de mercado.
17. **Pipeline de Vendas (CRM Comercial):** Controle de funil de vendas, prospecção e taxa de conversão comercial.

### C. Capacidades de Engenharia & Automação (ENDAP Engineering)
18. **Calculadoras Técnicas:** Ferramentas matemáticas para dimensionamento (cálculo de carga térmica para HVAC, dimensionamento de cabos elétricos, bobinagem de motores elétricos).
19. **CLP & Automação Industrial:** Ambientes de diagnóstico, mapas de registradores Modbus/BACnet e depuração de CLP (Controlador Lógico Programável).
20. **Firmware Compiler:** Utilitários para compilação, flashing e configuração de placas e dispositivos microcontroladores de automação.
21. **IoT Gateway & Telemetria:** Protocolos de comunicação física (MQTTS, HTTP) para aquisição de dados de sensores e status de máquinas em tempo real.
22. **SCADA Integration:** Interface com sistemas supervisórios industriais para leitura/escrita de variáveis físicas de processo.

---

## ETAPA 2 — MATRIZ DE RESPONSABILIDADE (RACI & ESCOPO)
Esta matriz define formalmente a propriedade exclusiva e o compartilhamento de cada capacidade:

| Capacidade | Propriedade de Escopo | Justificativa Técnica / Arquitetural |
| :--- | :--- | :--- |
| **CRM / Clientes / Sites** | **EXCLUSIVA DO AFERIX** | O Aferix é a Fonte Única de Verdade (SSOT) sobre o relacionamento operacional do prestador. Outros produtos consultam via API. |
| **Ativos (CMMS/EAM)** | **EXCLUSIVA DO AFERIX** | O histórico de intervenções em equipamentos de campo pertence ao núcleo de ordens de serviço e preventiva (PMOC). |
| **Contratos e SLAs** | **EXCLUSIVA DO AFERIX** | A execução e faturamento recorrente dependem do banco local Dexie e orquestração do ERP. |
| **Ordens de Serviço / Agenda**| **EXCLUSIVA DO AFERIX** | O técnico em campo precisa de uma ferramenta offline-first robusta para fechar serviços diários. |
| **Assinatura e Checklists** | **EXCLUSIVA DO AFERIX** | Ferramentas exclusivas de execução física e conformidade regulamentar em campo. |
| **PMOC Checklists** | **EXCLUSIVA DO AFERIX** | Trata-se de execução local com forte exigência offline-first para vistorias em subsolos e áreas isoladas. |
| **Financeiro Operacional** | **EXCLUSIVA DO AFERIX** | Trilha determinística de mutações financeiras baseada em transições de status da OS e do caixa local. |
| **Orçamentos (Estimativas)** | **EXCLUSIVA DO ORÇAOS** | O OrçaOS é o motor focado em fechar negócios rapidamente. O fluxo comercial deve ser desacoplado da execução da OS. |
| **Calculadoras Financeiras** | **EXCLUSIVA DO ORÇAOS** | Algoritmos de precificação, Markup e simulação de taxas de cartão devem residir no motor comercial de propostas. |
| **Catálogo Global de Insumos**| **EXCLUSIVA DO ORÇAOS** | Gerenciar tabelas gigantescas de fornecedores no banco offline do Aferix degradaria a performance em celulares simples. |
| **Propostas Interativas** | **EXCLUSIVA DO ORÇAOS** | Construtor web de páginas premium responsivas para fechar contratos com links compartilháveis. |
| **Calculadoras Técnicas** | **EXCLUSIVA DO ENDAP** | Pertence ao contexto físico/matemático de engenharia e automação, e não ao controle financeiro ou de campo de OS. |
| **CLP & Automação** | **EXCLUSIVA DO ENDAP** | Diagnóstico técnico de controladores requer bibliotecas específicas e drivers físicos que não cabem no escopo de um ERP. |
| **Firmware & Flashing** | **EXCLUSIVA DO ENDAP** | Requer interface direta de hardware (WebUSB/WebSerial) que sobrecarregaria o Aferix ERP. |
| **IoT Gateway & Sensores** | **EXCLUSIVA DO ENDAP** | O ENDAP é a plataforma de telemetria responsável pelo processamento de eventos físicos em escala de milissegundos. |

### Capacidades Compartilhadas (Mecanismo de Interoperabilidade)
As capacidades compartilhadas representam pontos de conexão e transição limpos por meio de APIs ou Eventos Assíncronos:

1. **Aferix <-> OrçaOS (Conversão Comercial-Operacional):**
   * *Ação:* Quando um orçamento comercial é aprovado pelo cliente final na página web gerada pelo **OrçaOS**, um evento `PROPOSAL_APPROVED` é emitido. 
   * *Integração:* O **Aferix** intercepta esse evento, importa os dados do cliente/site e spawna automaticamente o *Atendimento* e a correspondente *Ordem de Serviço (OS)* de instalação, vinculando o orçamento como snapshot histórico imutável.
   
2. **Aferix <-> ENDAP (Manutenção Preditiva & Telemetria):**
   * *Ação:* O **ENDAP** monitora sensores físicos de temperatura/pressão via IoT. Quando uma regra de anomalia é disparada (ex: sobreaquecimento), emite um evento `ANOMALY_DETECTED`.
   * *Integração:* O **Aferix** recebe este sinal e gera automaticamente um *Atendimento Preventivo Emergencial* na agenda do técnico do respectivo site para inspeção imediata.

3. **OrçaOS <-> ENDAP (Dimensionamento Automatizado):**
   * *Ação:* O engenheiro dimensiona um projeto de climatização no **ENDAP** (calculando a carga térmica de 60.000 BTUs).
   * *Integração:* O **ENDAP** envia os parâmetros dimensionados para o **OrçaOS**, que monta o orçamento ideal selecionando o modelo exato do ar-condicionado e tubulação recomendados do catálogo de insumos.

---

## ETAPA 3 — IDENTIFICAÇÃO DE CONFLITOS DE ESCOPO (RISK REGISTRY)
Identificação dos riscos que ameaçam a integridade arquitetural do ecossistema e sua classificação de gravidade:

### Conflitos P0 (Ação Corretiva Imediata)
1. **Duplicação de Cadastro de Clientes e Endereços:**
   * *Descrição:* Aferix e OrçaOS mantendo tabelas de clientes e locais redundantes, gerando divergências cadastrais insolúveis ("Qual cliente está atualizado?").
   * *Resolução:* O banco de dados do **Aferix (Core)** é a única SSOT de Clientes e Sites. O OrçaOS deve consultar o Core para selecionar clientes ou adicionar novos cadastros de forma sincronizada através de endpoints isolados.
2. **Tabelas Concorrentes de Orçamentos:**
   * *Descrição:* Aferix tratando orçamentos como registro de campo no Dexie local e o OrçaOS gravando orçamentos na nuvem de forma diferente, gerando bugs na conversão de markup.
   * *Resolução:* O **OrçaOS** detém o modelo comercial do orçamento (Markup, margem de venda, impostos). O **Aferix** apenas importa o orçamento aprovado sob a forma de um *Snapshot Financeiro Congelado* na OS, imutável para auditoria tributária.

### Conflitos P1 (Ação Recomendável a Médio Prazo)
3. **Calculadoras Misturadas:**
   * *Descrição:* O técnico tentando calcular o dimensionamento de cabos (engenharia) dentro do form de orçamento rápido no Aferix, aumentando o tamanho do app offline.
   * *Resolução:* O formulário do Aferix permanece financeiro (preço do metro de cabo). Toda a matemática de dimensionamento elétrico de engenharia fica isolada no **ENDAP**, que exporta a lista de materiais finais por API para o OrçaOS precificar.
4. **PMOC Checklists vs IoT Polling:**
   * *Descrição:* Tentativa de injetar conexões TCP/Modbus diretamente na aplicação offline-first Aferix para autocompletar checklists em tempo real.
   * *Resolução:* O Aferix carrega apenas os checklists em formulários interativos. Se houver telemetria, o Aferix faz um pull assíncrono para o endpoint de histórico de sensores do **ENDAP** para autocompletar campos específicos (ex: pressão atual), sem tocar em drivers físicos de IoT.

### Conflitos P2 (Ajustes de Organização)
5. **Painéis de Métricas Duplicados (Dashboards):**
   * *Descrição:* Clientes do OrçaOS vendo gráficos de lucratividade da empresa e o Aferix mostrando o mesmo no painel financeiro.
   * *Resolução:* O dashboard do **OrçaOS** foca em taxas de conversão de propostas, velocidade comercial e funil de vendas. O dashboard do **Aferix** foca exclusivamente em EBITDA, lucro operacional real (recebimentos vs despesas de campo) e utilização de técnicos.

---

## CONSTRANGIMENTOS ARQUITETURAIS RÍGIDOS
1. **Zero Raw DB Access:** O React de nenhum produto acessa o banco de dados dos outros. Toda a comunicação é feita através de serviços de integração blindados e APIs REST.
2. **Offline-First Constraints:** O **Aferix** deve manter sua arquitetura 100% resiliente a quedas de rede (local-first via Dexie). O **OrçaOS** é uma ferramenta de web comercial rica em conexões com catálogos externos, dependendo de rede ativa. O **ENDAP** opera em servidores de rede locais ou gateways de borda robustos para telemetria contínua.
3. **No Code Sharing on Core Logic:** A lógica de Markup e cálculo financeiro do OrçaOS não deve ser duplicada no Aferix. O Aferix confia plenamente nos cálculos estruturados recebidos na importação do orçamento.
