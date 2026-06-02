# Auditoria: Day in the Life do Técnico em Campo

**Data:** 31/05/2026
**Foco:** Operação Real, Velocidade, Ergonomia, Fluxo de Trabalho
**Objetivo:** Validar a autonomia de um técnico para rodar o dia inteiro exclusivamente através do Aferix, medindo atritos, toques e viabilidade em campo (caminhonete, rua, sob o sol).

---

## 1. Novo Projeto (Orçamentação Completa)
*Cenário:* O técnico chega à obra, faz o levantamento de materiais e monta a proposta.
- **Fluxo:** Tactical Bar (`+`) > NOVO PROJETO > Seleciona Cliente > Abre Catálogo > Adiciona 3 itens > Salva.
- **Quantidade de Toques:** ~8 a 10 toques.
- **Quantidade de Telas:** 2 telas (Budget Form + Catálogo em Step).
- **Tempo Estimado:** 2 a 3 minutos.
- **Pontos de Fricção:** A digitação de escopo e busca no catálogo sob o sol pode ser incômoda, mas a nova navegação de "Internal Step" do catálogo mitigou o uso de modais pesados.
- **Oportunidades de Simplificação:** Criação de "Kits de Serviço" pré-montados no catálogo para evitar selecionar itens um a um.
- **Classificação:** **Bom** (Trata-se de um projeto, a carga de inserção de dados é naturalmente maior, mas o fluxo é linear).

## 2. Atendimento Rápido Pago
*Cenário:* O técnico é chamado para consertar uma tomada. Conserta, cobra R$ 150 no Pix, e vai embora.
- **Fluxo:** Tactical Bar (`+`) > ATENDIMENTO RÁPIDO > Nome Rápido > Descrição ("Troca de tomada") > R$ 150 > Toggle 'Recebido' ON > Salvar.
- **Quantidade de Toques:** ~6 toques (contando com inputs).
- **Quantidade de Telas:** 1 tela (QuickServiceForm).
- **Tempo Estimado:** 25 a 35 segundos.
- **Pontos de Fricção:** Nenhum atrito sistêmico. O teclado nativo cobre metade da tela, mas os inputs estão bem posicionados no topo.
- **Oportunidades de Simplificação:** Sugestões automáticas de serviços recentes ao focar no campo "Descrição" para evitar digitação.
- **Classificação:** **Excelente** (Nível de caixa de supermercado).

## 3. Atendimento Rápido Não Pago
*Cenário:* O técnico presta o serviço de urgência para um cliente fiel, mas o cliente diz "te pago na sexta".
- **Fluxo:** Tactical Bar (`+`) > ATENDIMENTO RÁPIDO > Cliente (busca rápida) > Descrição ("Reparo disjuntor") > R$ 200 > Toggle 'Recebido' OFF > Salvar.
- **Quantidade de Toques:** ~5 toques.
- **Quantidade de Telas:** 1 tela.
- **Tempo Estimado:** 20 a 30 segundos.
- **Pontos de Fricção:** Idêntico ao Pago. A ausência do toggle de recebimento simplifica um clique.
- **Oportunidades de Simplificação:** Nenhuma imediata. O fluxo é enxuto.
- **Classificação:** **Excelente**.

## 4. Garantia (Retorno Técnico)
*Cenário:* Um ar-condicionado instalado ontem parou. O técnico precisa ir lá verificar, gerando custo de deslocamento mas faturamento R$ 0.
- **Fluxo Atual:** Tactical Bar (`+`) > ATENDIMENTO RÁPIDO > Seleciona Cliente > Descrição ("Garantia/Retorno") > Valor R$ 0 > Salvar.
- **Quantidade de Toques:** ~6 toques.
- **Quantidade de Telas:** 1 tela.
- **Tempo Estimado:** 30 segundos.
- **Pontos de Fricção:** O sistema requer que o técnico crie um faturamento "zerado" manualmente. O técnico tem que pensar como hackear o sistema em vez de apertar um botão "Acionar Garantia" na O.S. original. Isso corrompe sutilmente a análise de LTV e histórico real do equipamento.
- **Oportunidades de Simplificação:** Um botão contextual "Garantia / Retorno" diretamente no histórico da O.S. original do cliente, que já copia os dados e marca como custo operacional sem faturamento.
- **Classificação:** **Fricção Alta** (Cognitivamente falho, exige "gambiarra" do usuário).

## 5. Cobrança (Recebimento de Pendentes)
*Cenário:* É sexta-feira. O técnico precisa cobrar o cliente do "Atendimento Não Pago" e dar baixa.
- **Fluxo:** Navega para `Financeiro` (Tab) > Procura na lista de "A Receber" > Abre detalhe da O.S. > Marca como Pago > Salva.
- **Quantidade de Toques:** ~4 a 5 toques.
- **Quantidade de Telas:** 2 telas (Financeiro + Modal/Detalhe).
- **Tempo Estimado:** 20 segundos.
- **Pontos de Fricção:** Requer caça ativa na lista do financeiro.
- **Oportunidades de Simplificação:** Uma Action na `Home` exibindo "3 Recebimentos Atrasados" com botão de "Baixa Rápida" em 1 clique (Swipe-to-pay).
- **Classificação:** **Aceitável**.

## 6. Consulta Histórica
*Cenário:* O técnico chega num cliente antigo e quer lembrar qual fio usou no mês passado.
- **Fluxo:** Tab `Clientes` > Toca na barra de Busca > Digita nome > Toca no card > Visualiza histórico de Serviços (O.S.).
- **Quantidade de Toques:** ~4 toques.
- **Quantidade de Telas:** 2 telas (Workspace de Clientes + ClientProfile).
- **Tempo Estimado:** 15 a 20 segundos.
- **Pontos de Fricção:** Se a base de clientes for imensa, a busca e carregamento podem gerar milissegundos de delay, mas a nova UI focada em *Thumb-First* e *SurfaceCards* torna a leitura incrivelmente confortável sob a luz do sol.
- **Oportunidades de Simplificação:** Busca global acessível em qualquer tela (Spotlight search) para pular direto para a ficha do cliente.
- **Classificação:** **Bom**.

## 7. Agenda do Dia
*Cenário:* O técnico acorda e quer saber para onde vai.
- **Fluxo:** Abre o Aferix na tela `Home` (Cockpit).
- **Quantidade de Toques:** 0 toques (Visualização passiva) ou 1 toque na Tab `Agenda`.
- **Quantidade de Telas:** 1 tela (Home).
- **Tempo Estimado:** 2 segundos.
- **Pontos de Fricção:** Zero. O card "Próximo na Agenda" (P2 - Continuity) da Home V25 exibe local e horário na cara.
- **Oportunidades de Simplificação:** Botão nativo de "Navegar (Waze/Maps)" integrado ao card da agenda.
- **Classificação:** **Excelente**.

---

### Veredito Final
Um técnico autônomo consegue, sem ressalvas, viver de dentro do Aferix durante o expediente de campo. 

A refatoração ergonômica (Thumb-First) e a consolidação dos modos de entrada (Projeto vs. Rápido) removeram a paralisação por análise. O fluxo operacional é determinístico. 

O único tendão de Aquiles revelado no teste "Day in the Life" é o **Retorno de Garantia**, que ainda exige que o usuário invente uma gambiarra contábil. A interface de cobrança ativa também apresenta leve engasgo, sendo apenas "aceitável" para um app que se propõe a ser hiper-eficiente.
