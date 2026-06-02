# CONSTITUIÇÃO DE PLATAFORMA & FONTES DA VERDADE (SSOT)
**Status:** CONGELADO E RATIFICADO  
**Data de Emissão:** 01 de Junho de 2026  
**Efeito:** Imediato e vinculante a todos os times de engenharia e agentes de inteligência.

---

## PREÂMBULO
Esta Constituição estabelece de forma imutável a soberania de dados, a propriedade de entidades de domínio e os fluxos de gravação no ecossistema integrado **Aferix**, **OrçaOS** e **ENDAP**, definindo a **Fonte Única de Verdade (Single Source of Truth - SSOT)** de cada dado para blindar a integridade estrutural e afastar conflitos de persistência.

---

## SEÇÃO I — MATRIZ OFICIAL DE PERSISTÊNCIA E SSOT

Fica decretado que a propriedade primária, autoridade de gravação e barramento de sincronização das entidades do ecossistema seguem a matriz abaixo:

| Entidade | SSOT (Dono Primário) | Autoridade de Escrita | Estratégia de Sync / Distribuição | Justificativa Arquitetural |
| :--- | :--- | :--- | :--- | :--- |
| **Client** | **Aferix (Hub)** | Aferix (ERP) & APIs Autorizadas | Sincronização offline-first via Dexie <-> Supabase RLS. | O cliente é o núcleo do faturamento operacional. O OrçaOS apenas consulta ou envia chamadas de criação via API REST. |
| **Site** | **Aferix (Hub)** | Aferix (ERP) | Replicação assíncrona para o cache local do técnico. | Locais de instalação de equipamentos são fundamentais para as OS. ENDAP e OrçaOS leem via API do Aferix. |
| **Asset** | **Aferix (Hub)** | Aferix (ERP) & APIs Autorizadas | Relação estrita com OS de preventivas / corretivas local. | Histórico físico de vida útil de compressores, CLPs e painéis solares é base da conformidade regulamentar. |
| **Contract** | **Aferix (Hub)** | Aferix (ERP) | Persistido centralmente na nuvem com controle de faturamento local. | Contratos regulam faturamento e prazos de visitas preventivas PMOC. Pertence inteiramente ao ERP Aferix. |
| **Attendance** | **Aferix (Hub)** | Aferix (ERP) & APIs Autorizadas | Eventos em fila FIFO com processamento assíncrono. | Triagem operacional de chamados técnicos de emergência ou solicitações de preventivas programadas. |
| **WorkOrder** | **Aferix (Hub)** | Aferix (ERP) | Local-first Dexie com sincronização atômica de transações. | O técnico em campo opera em subsolos, elevadores e áreas sem rede. Toda a gravação e check-in da OS reside no Aferix. |
| **Proposal** | **OrçaOS (Spoke)** | OrçaOS (Commercial) | Hospedagem centralizada na nuvem com visualizador dinâmico. | Construtor de links interativos para propostas comerciais. Uma vez assinada, o OrçaOS emite snapshot para o Aferix. |
| **Budget** | **OrçaOS (Spoke)** | OrçaOS (Commercial) | Nuvem central para acesso a cotações de fornecedores em tempo real. | Motor comercial de Markup, cálculo de despesas estimadas, horas estimadas e margens de lucro bruto. |
| **Price Catalog** | **OrçaOS (Spoke)** | OrçaOS (Commercial) | Tabela centralizada com cache local volátil no client OrçaOS. | Cadastro gigantesco de insumos de fabricantes. Excluído do Aferix móvel para economizar memória e tráfego de dados. |
| **Device** | **ENDAP (Spoke)** | ENDAP (Engineering) | Ingestão e batimento de pulso cardíaco (heartbeat) direto de gateways. | Cadastro de microcontroladores físicos, gateways de campo e sensores industriais. ERP Aferix lê apenas para identificação. |
| **Gateway** | **ENDAP (Spoke)** | ENDAP (Engineering) | Persistência lógica com triggers automáticos de reconexão TCP. | Equipamento concentrador físico de redes de automação no cliente. |
| **Automation Rule**| **ENDAP (Spoke)** | ENDAP (Engineering) | Nuvem central com push de lógica e mapeamento Modbus/Modbus IP. | Script de condições de automação (ex: *se sensor_temperatura > 35°C, disparar anomalia*). |

---

## SEÇÃO II — LEIS CONSTITUCIONAIS DE PERSISTÊNCIA E INTEROPERABILIDADE

### Artigo 1º — Da Autoridade Exclusiva de Escrita (Write Control)
1. Nenhum Spoke está autorizado a escrever diretamente em tabelas controladas por outro produto.
2. Alterações cadastrais de `Client` ou `Site` originadas na interface do **OrçaOS** deverão obrigatoriamente ser encaminhadas via API REST estruturada para o gateway central do **Aferix Platform**, que validará os dados antes de gravar na SSOT.

### Artigo 2º — Do Isolamento de Bancos de Dados
1. O banco local IndexedDB (Dexie) do **Aferix** é estritamente operacional. Ele **jamais** armazenará registros brutos de telemetria, histórico de variáveis físicas de sensores (ENDAP) ou catálogos massivos de fornecedores (OrçaOS).
2. O **OrçaOS** é uma aplicação baseada em rede. Seus orçamentos ativos e catálogos não serão replicados para armazenamento permanente no Dexie local do técnico móvel. O Aferix carrega apenas snapshots estáticos dos orçamentos já aprovados e associados a Ordens de Serviço em andamento.

### Artigo 3º — Do Acoplamento por APIs e Abstração de Persistência
1. A comunicação síncrona entre os produtos para fins de leitura de dados utilizará endpoints RESTful documentados com autenticação JWT centralizada.
2. Em cenários offline-first do Aferix, as dependências de dados de Spokes (como consultar se um dispositivo cadastrado no ENDAP está ativo) devem ser resolvidas exibindo o último estado sincronizado conhecido no cache local, impedindo o bloqueio da interface do técnico em campo.

### Artigo 4º — Das Proibições de Redundância Operacional
1. **É terminantemente proibido** ao Aferix manter calculadoras complexas de margem Markup comercial ou bancos de dados de fornecedores. Ele se restringe a processar as mutações financeiras reais ocorridas (receitas e despesas físicas).
2. **É terminantemente proibido** ao OrçaOS manter ferramentas de controle de agenda de técnicos ou preenchimento de checklists PMOC. Ele se restringe a precificar e gerar as propostas originais.
3. **É terminantemente proibido** ao ENDAP manter controle de fluxo de caixa, orçamentos comerciais ou faturamento recorrente. Ele se restringe ao controle técnico e telecomunicação de hardware.
