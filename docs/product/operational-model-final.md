# Modelo Operacional Consolidado (Operational Model Final)

**Data:** 31/05/2026
**Objetivo:** Estabelecer definitivamente os dois únicos modos operacionais do sistema Aferix. Todo e qualquer fluxo de venda/execução deve pertencer estritamente a um destes caminhos. A decisão de uso baseia-se unicamente na "linha do tempo" do serviço.

---

## 1. O Modelo Mental Binário

O sistema oferece agora **duas vias** de entrada. A terceira via (o antigo "Orçamento Express") foi absorvida para eliminar a carga cognitiva no uso em campo.

### Modo A: Novo Projeto
**Quando usar:** Quando o serviço ainda vai acontecer, o preço precisa ser calculado, o cliente precisa aprovar formalmente ou a execução demanda planejamento e múltiplas visitas.
**Exemplos reais:** Reforma completa elétrica; Instalação de múltiplos ares-condicionados; Contrato de manutenção mensal.

### Modo B: Atendimento Rápido
**Quando usar:** Quando o serviço já aconteceu, o preço já foi cobrado e (geralmente) já recebido. É a "caderneta do PDV".
**Exemplos reais:** Troca emergencial de uma tomada; Reparo simples num disjuntor desarmado; Chamado de urgência de desentupimento com valor fechado no local.

---

## 2. Comportamento Sistêmico por Entidade

A mágica arquitetural do Aferix é que **ambos os modos geram exatamente as mesmas entidades de banco de dados**. O *Atendimento Rápido* não fura o banco, ele apenas acelera a esteira.

| Entidade | Novo Projeto | Atendimento Rápido |
| :--- | :--- | :--- |
| **Cliente (CRM)** | Busca minuciosa. Requer cadastro completo com endereço para emissão de PDF e contrato. | Instancia o ID de um cliente existente ou cadastra rapidamente apenas nome, gerando LTV instantâneo. |
| **Orçamento** | Aberto. Preenchido via Catálogo (múltiplos itens, materiais, labor). Status: `INICIADO`. | Fechado. Um item genérico contendo o valor final. Status: Avança direto para `FINALIZADO` via Facade. |
| **Ordem de Serviço** | Gerada apenas quando o Orçamento é aprovado pelo cliente. Fica `PENDENTE` até a data do serviço. | Criada e liquidada simultaneamente com o status `completed`. |
| **Financeiro** | Previsão de parcelas e faturamento baseado na execução progressiva da OS. | Lançamento único (à vista) que cai diretamente no caixa como dinheiro realizado, se o toggle "Recebido" for ativado. |

---

## 3. Impactos na Gestão de Dados (BI e CRM)

- **Impacto em CRM:** O Atendimento Rápido aumenta a quantidade de clientes rasos na base, porém garante que **100% da receita** gerada pelo técnico esteja rastreada para o Life-Time Value (LTV) daquele nome/contato. É preferível ter um CRM com telefones em branco do que faturamentos de R$ 150 não computados que distorcem o LTV.
- **Impacto em BI (Business Intelligence):** O BI precisará compreender que orçamentos originados por `Atendimento Rápido` terão um "SLA de Fechamento" (Tempo entre criar proposta e receber dinheiro) igual a ZERO. Em dashboards executivos corporativos, essas métricas deverão ser apartadas ou o BI será contaminado.
- **Impacto Financeiro:** A consolidação do Express no Atendimento Rápido assegura precisão no FLUXO DE CAIXA REALIZADO. Nenhum pequeno conserto "vaza" do aplicativo por preguiça de preenchimento.

---

**Princípio de Design Executivo (Final):** O técnico não pensa *"como vou lançar"*. O técnico sabe *"o que eu fiz"*. O software é responsável por adequar as complexidades do ERP sob os panos do `operationalFacade`.
