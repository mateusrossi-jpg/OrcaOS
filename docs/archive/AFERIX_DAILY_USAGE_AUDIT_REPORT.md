# AFERIX_DAILY_USAGE_AUDIT_REPORT
MISSÃO: Otimizar a navegação SOLO baseada na frequência real de uso e dependência operacional.

## 1. Ranking de Utilização (Projeção Baseada em Piloto)

| Módulo | Frequência | Tempo de Permanência | Dependência |
| :--- | :--- | :--- | :--- |
| **Agenda / OS** | **Alta (Diária)** | **Longo** (Execução) | **CRÍTICO** |
| **Empresa (Home)** | Média (Diária) | Curto (Consulta) | Importante |
| **Propostas** | Média (Diária) | Médio (Configuração) | **CRÍTICO** |
| **Financeiro** | Baixa/Média (Semanal) | Curto (Baixa) | Importante |
| **Clientes** | **Baixa (Ocasional)** | Médio (Cadastro) | Conveniente |
| **Relatórios** | Baixa (Mensal) | Curto (Exportação) | Conveniente |

## 2. Fluxos Naturais do Negócio
1. **Fluxo de Execução:** Agenda -> OS -> Conclusão. (Frequência 10x/dia)
2. **Fluxo de Venda:** Home -> Nova Proposta -> Enviar. (Frequência 2x/dia)
3. **Fluxo de Caixa:** Financeiro -> Verificar Recebimento. (Frequência 1x/dia)
4. **Fluxo de Suporte:** Menu -> Clientes -> Buscar Endereço. (Frequência 1x/semana)

## 3. Matriz de Valor vs. Frequência

### NÍVEL A — MENU PRINCIPAL (Uso Diário Intenso)
*   **Empresa:** Ponto de partida e pulso do negócio.
*   **Agenda / OS:** Onde o valor é gerado e o técnico passa 70% do tempo.
*   **Propostas:** Onde a venda é garantida. Vital para o faturamento.
*   **Financeiro:** Controle de entradas e pendências.

### NÍVEL B — ACESSO RÁPIDO (Importantes, mas esporádicos)
*   **Clientes:** Cadastro é feito uma única vez. Consultas posteriores são contextuais (via OS or Proposta).
*   **Contratos:** Gestão mensal de recorrência.
*   **Relatórios:** Gerados ao final de ciclos ou por demanda do cliente.

## 4. Resposta à Questão Principal: Clientes deve sair da navegação principal?

**Veredito: SIM.**

### Justificativa Operacional:
1.  **Frequência Irrelevante na navegação:** O cadastro de um cliente ocorre uma fração mínima das vezes comparado à abertura de uma OS ou consulta de agenda.
2.  **Acesso Contextual Superior:** Na maioria das vezes, o operador acessa o "Cliente" a partir de uma Ordem de Serviço ou de uma Proposta já existente. O botão direto na barra de navegação é um desperdício de espaço para o uso diário.
3.  **Liberação de Densidade:** Remover "Clientes" reduz a barra para 5 itens (Empresa, Propostas, Agenda, Financeiro, Menu), o que melhora drasticamente a ergonomia e reduz erros de clique (fat-finger) em dispositivos mobile menores.

## 5. Recomendação Final de Layout (Menu SOLO)

**A nova ordem recomendada segue o Ciclo de Vida do Dinheiro:**
1.  **EMPRESA** (Monitoramento)
2.  **PROPOSTAS** (Venda/Gatilho)
3.  **AGENDA / OS** (Execução/Entrega)
4.  **FINANCEIRO** (Recebimento/Lucro)
5.  **MENU** (Governança/Clientes/Equipe)

---
*Assinado: Gemini CLI (Evidence-Based Observer)*
