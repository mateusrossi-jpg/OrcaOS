# AFERIX OPERATIONAL REALITY AUDIT V1
**DA EMPRESA REAL AO ECOSSISTEMA OPERACIONAL**

## 1. Auditoria Operacional Completa
O Aferix resolve magistralmente a execução do laudo (TTV de 2 minutos). Porém, quando testamos o sistema sob o estresse de uma empresa operando 8 horas por dia, com 1 gestor e 4 técnicos, o tecido conectivo entre as pontas falha. O sistema ainda opera como um conjunto de ferramentas isoladas (Criar OS, Criar Orçamento, Executar Checklist) em vez de funcionar como o sistema nervoso central e autônomo da empresa.

---

## 2. Simulação de um Dia Real (A Fricção Operacional)

### 07:00 - O Dono Abre o Sistema
**A Realidade:** O gestor toma café e precisa saber 3 coisas: Quem vai pra onde hoje? O que está atrasado? Quais orçamentos o cliente aprovou ontem?
**O Problema (Aferix):** Nossa home hoje (após a refatoração PLG) é voltada para conversão de novos usuários. O dono da empresa não tem um "Painel de Comando". Ele precisa clicar em menus soltos para ver o estado da empresa.
**A Fuga:** Ele abre a planilha de escalas no Google Sheets ou pergunta no grupo de WhatsApp da empresa "Bom dia, quem vai no Shopping Central?".

### 08:00 - Técnicos Saem para Campo
**A Realidade:** O técnico pega a van e abre o app.
**O Problema (Aferix):** Ele precisa ir no menu "Atendimentos" ou "OS" e procurar pelo cliente.
**A Solução Ideal:** O app deve acordar na tela "Minha Agenda Hoje". 1 clique. O GPS já sabe onde ele deveria estar.

### 09:00 - O Primeiro Problema (Anomalia)
**A Realidade:** O técnico encontra um motor queimado.
**O Problema (Aferix):** Ele registra a não conformidade no checklist. E aí? O fluxo morre no laudo. Como isso vira uma venda (Orçamento)?
**A Fuga (P0):** O técnico manda um áudio no WhatsApp para o dono: *"Chefe, motor queimou, passa um orçamento pro cara"*. O dono cria um orçamento do zero no Aferix. Perdemos a cadeia de valor. 
**A Solução Ideal:** 1 clique no laudo: `[Gerar Orçamento a partir desta Anomalia]`.

### 11:00 - O Cliente Faz uma Pergunta
**A Realidade:** O cliente pergunta *"Esse ar condicionado quebrou mês passado também?"*.
**O Problema (Aferix):** O técnico está dentro da tela de execução do checklist. Ele não tem acesso fácil ao passado daquela máquina específica.
**A Fuga:** Ele procura no WhatsApp ou responde *"Vou confirmar com a base"*. Perda de credibilidade.

---

## 3. Mapeamento de Fugas do Sistema (Leakage Map)

| Fuga Operacional | Como Acontece | Classificação | Solução no Aferix |
| :--- | :--- | :--- | :--- |
| **Comunicação de Defeito** | Técnico manda áudio no WhatsApp para o gestor fazer orçamento. | **P0** | Botão `Transformar Anomalia em Orçamento`. |
| **Histórico de Máquina** | Técnico liga para a base para saber quando foi a última troca de peça. | **P0** | `Asset Timeline` acessível direto da execução. |
| **Aprovação de Laudo/OS** | Dono envia PDF, cliente aprova dizendo "Ok" no WhatsApp. | **P1** | Link de aprovação digital (Client Portal). |
| **Escala Diária** | Gestor distribui tarefas por mensagem no grupo da equipe. | **P1** | Gestão de Despacho / Agenda do Técnico. |
| **Controle de Garantia** | Dono troca peça de graça pois "acha" que ainda está na garantia. | **P2** | Alerta de Garantia Ativa ao abrir nova OS. |

---

## 4. Timeline do Cliente (O CRM de Verdade)
Atualmente, o cadastro do cliente é estático. Uma ficha de endereço.
**Impacto:** O valor do CRM é nulo.
**Como deve ser:** A página do cliente deve ser um Feed no estilo "Facebook/Twitter". 
*   *02/06/2026 - Laudo do Shopping Central Finalizado.*
*   *01/06/2026 - Orçamento #100 aprovado por João.*
*   *15/05/2026 - Nova máquina cadastrada.*
Retenção absoluta: o cliente nunca abandonará a empresa porque todo o "prontuário médico" dos seus prédios está neste feed.

## 5. Timeline do Ativo (O Prontuário Médico)
Um Chiller de R$ 500.000 não é apenas um cadastro. É uma entidade viva.
Ao clicar no Ativo `AC-001`, o técnico deve ver a linha do tempo exclusiva da máquina.
Isso dá ao técnico o superpoder da onisciência. Se o motor foi trocado há 2 meses e pifou de novo, o técnico não será feito de bobo pelo equipamento.

## 6. Pesquisa Universal
**O Problema:** Hoje a navegação é estruturada. Se o cliente liga e fala *"Sou do Shopping Central, referente ao Orçamento 1045"*, o gestor sofre para achar.
**A Solução (P1):** Uma barra fixa estilo Spotlight (Mac) no topo do app. 🔍 `Pesquisar Tudo`. O usuário digita "Shopping", e o Aferix retorna na mesma lista: o cliente, a OS do dia, as máquinas e os orçamentos. 

## 7. Garantias e Retornos (O Guardião de Lucro)
O retorno não cobrado é o que quebra pequenas empresas de serviço.
**Como resolver (P2):** Sempre que o gestor tentar agendar um serviço corretivo para um ativo, o sistema calcula `data atual - data do último serviço`. Se for menor que 90 dias, a UI grita um alerta amarelo: ⚠️ **ALERTA: Este equipamento sofreu intervenção há 42 dias. Possível Retorno em Garantia.**

## 8. Portal do Cliente (A Área Vip)
`cliente.aferix.com`
O cliente não quer receber PDFs no WhatsApp e perdê-los 6 meses depois na hora de uma auditoria da ANVISA. 
O Aferix fornecerá um link fixo. O cliente entra e vê: Todas as suas faturas pagas, todos os laudos, e o status de conformidade dos seus prédios.
**Efeito:** Percepção Premium imediata. O prestador de serviço de "fundo de quintal" passa a ter o portal de uma multinacional.

---

## 9. Lacunas Operacionais (O Que Falta para o SO)
1. **Ponte Anomalia -> Orçamento:** O gap mais fatal hoje.
2. **Dashboard de Operações (Despacho):** O dono precisa ver a agenda do dia, não um dashboard genérico.
3. **Barra de Pesquisa Global.**
4. **Alerta de Garantias.**
5. **Timeline de Equipamentos.**

---

## 10. Matriz Impacto x Esforço

| Iniciativa | Impacto Operacional | Esforço Técnico | Decisão |
| :--- | :--- | :--- | :--- |
| Converter Anomalia em Orçamento | Gigante (Gera Dinheiro) | Médio | P0 |
| Timeline do Ativo | Alto (Ganha Confiança) | Baixo | P1 |
| Dashboard do Gestor (Agenda) | Alto (Reduz WhatsApp) | Médio | P1 |
| Pesquisa Universal | Médio (Agilidade) | Médio | P1 |
| Alertas de Garantia | Alto (Salva Dinheiro) | Alto (Regras complexas) | P2 |
| Portal do Cliente | Gigante (Retenção e Escala) | Muito Alto | P2 |

---

## 11. Roadmap P0 (Geração de Receita Imediata)
**Trincheira atual:** Criar a ponte entre Execução e Venda.
Se um checklist falha (anomalia detectada), o sistema deve oferecer instantaneamente a geração de um Orçamento/Proposta Comercial associada àquela foto e defeito. Isso fecha o ciclo "Operação gera Venda".

## 12. Roadmap P1 (Inteligência Tática)
**Próxima Trincheira:** Timeline de Ativos e Dashboard do Gestor (Quem está fazendo o que hoje?). Pesquisa global para acabar com o "procurar em listas".

## 13. Roadmap P2 (O Fosso Competitivo)
Garantias (motor de regras contra prejuízo) e o Portal do Cliente (para amarrar o cliente do nosso cliente à plataforma).

---

## 14. Score de Maturidade Operacional
O Aferix hoje: **Grau 6 / 10** (Ferramenta excelente de ponta, laudo insuperável, UX de campo resolvida. Falta a cola operacional que faz o dono parar de usar WhatsApp).

---

## 15. Veredito Executivo
O Aferix provou que é a melhor forma do mundo para preencher um checklist e gerar um laudo (TTV de 2 min). **Missão 1 concluída.** 
Porém, uma empresa não sobrevive só de laudos. Ela sobrevive do ciclo infinito: **Manutenção -> Quebra -> Orçamento -> Conserto -> Manutenção.** Hoje, o nosso ciclo é interrompido na "Quebra". 

## 16. Próxima Trincheira de Produto
Nossa P0 absoluta (Próxima Trincheira) não é criar mais relatórios. **É construir a PONTE ANOMALIA -> ORÇAMENTO.** O Aferix precisa parar de ser apenas um "Gerador de Conformidade" e se tornar uma "Máquina de Vendas por Manutenção Corretiva". Se o ar condicionado quebrou no checklist, a proposta de conserto tem que nascer com 1 clique antes do técnico descer da escada.
