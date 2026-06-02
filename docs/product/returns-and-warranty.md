# Design System e Domínio: Retornos e Garantias (Retorno Técnico)

**Data:** 31/05/2026
**Responsável:** Aferix Agent (Antigravity)
**Contexto:** O Aferix encerra a gambiarra do "Serviço de R$ 0,00". Garantia não é venda subsidiada, é um *Custo de Qualidade*.

---

## 1. Visão Geral do Conceito

Garantias e Retornos ocorrem quando o profissional precisa revisitar o local de uma Ordem de Serviço (O.S.) concluída para corrigir falhas, sem que haja faturamento. 

No Aferix, a **Garantia é um evento derivado de uma O.S. raiz**. Ela herda a localidade, o cliente, e o escopo afetado daquela execução, gerando métricas passivas de "taxa de falha/retrabalho" sem poluir o pipeline de vendas e faturamento.

### Fluxo de Início:
`Ficha do Cliente` → `Aba de Histórico (OS)` → Toca em uma O.S. `Finalizada` → Aciona **"Acionar Garantia"**.

---

## 2. Modelo de Dados (`WarrantyReturn`)

A entidade de Garantia viverá separada da coleção de Orçamentos, mas associada intimamente a uma O.S.

```typescript
type WarrantyReturn = {
  id: string;
  originalWorkOrderId: string; // Chave estrangeira para a OS que deu problema
  clientId: string;            // Desnormalizado para acesso rápido no CRM
  siteId?: string;             // Onde o retorno será executado
  status: 'pending' | 'in-progress' | 'done' | 'archived';
  description: string;         // Qual é o defeito ou motivo do retorno?
  costEstimate: number;        // Custo estimado do retrabalho (tempo + material) - opcional
  scheduledAt?: string;        // Se houver data de agendamento do retorno
  createdAt: string;
  resolvedAt?: string;
}
```

### Relação com a O.S. Original
A O.S. raiz (`WorkOrder`) ganha uma flag semântica:
```typescript
type WorkOrder = {
  // ... outras props
  hasWarrantyClaim: boolean; // Indica visualmente que aquela O.S. teve problema
  warrantyReturnId?: string; // (Opcional) link rápido para o retorno em andamento
}
```

---

## 3. Impactos na Arquitetura Aferix

### 3.1 Impacto no CRM
- **Métrica de Confiabilidade:** O perfil do cliente exibirá uma contagem de "Garantias Acionadas" vs "Serviços Perfeitos".
- **Comunicação:** O histórico da timeline do cliente agrupa a Garantia imediatamente abaixo da O.S. original (aninhamento visual), deixando claro que é uma falha contida de um evento passado, não um evento novo independente.

### 3.2 Impacto Financeiro
- O faturamento da empresa permanece **intocado**. Um serviço de R$ 0,00 deixará de distorcer o Ticket Médio da empresa. 
- O Retorno Técnico deve ser computado exclusivamente como um **Custo Operacional Oculto** (tempo gasto, combustível, peça substituída). 

### 3.3 Impacto Operacional (Agenda e O.S.)
- **Na Agenda:** O `WarrantyReturn` aparecerá na agenda como um bloco diferenciado (cores de alerta/vermelho), evidenciando que aquele slot de tempo não está gerando dinheiro (LTV), e sim protegendo a reputação.
- **Nas O.S.:** O técnico não precisa repassar todo o fluxo de aprovação de orçamento ou "finalizar venda". Ele simplesmente aceita a garantia, agenda e, no fim do serviço, assinala a resolução (`resolvedAt`).

### 3.4 Impacto em B.I. (Business Intelligence)
- **Cálculo de Retrabalho:** Aferix agora pode calcular automaticamente a *Taxa de Refação* (Quantas OSs viram Garantias vs Total de OSs executadas).
- Se a empresa fatura bem mas tem alta Taxa de Refação, o B.I. poderá sinalizar no futuro que a lucratividade líquida está sendo esmagada pelo "combustível gasto nas sextas-feiras indo consertar serviço mal feito".

---

## 4. Oportunidades de Simplificação e Rollout
1. Adicionar o botão "Acionar Garantia" apenas se a O.S. estiver no status `done`.
2. Para simplificar a implantação, a garantia não gerará imediatamente conciliação financeira de custos extras, apenas travará a Agenda (que é o recurso mais escasso do autônomo).
3. Na Home, os retornos podem aparecer junto ao `Command Stream` (Atritos na Fila) como chamados prioritários para defesa da reputação.
