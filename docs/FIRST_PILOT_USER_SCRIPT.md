# Roteiro de Teste do Primeiro Usuário do Piloto — Aferix

Este documento estabelece o roteiro guiado para o facilitador técnico durante o primeiro teste presencial de 1 hora com o usuário autônomo final do Aferix **v0.1.0-rc.1**.

---

## 1. Detalhes Básicos da Sessão
* **Objetivo:** Avaliar a facilidade de uso, a clareza no cálculo de margens financeiras, a ergonomia da tela de execução móvel em campo e o comportamento offline do Aferix.
* **Duração Ideal:** 60 minutos.
* **Perfil do Usuário:** Prestador autônomo (eletricista, encanador ou técnico mecânico) que utiliza celular com frequência e quer otimizar o controle de lucro de seus serviços.

---

## 2. Preparação Prévia (Checklist do Facilitador)
* [ ] Servidor Host local rodando em modo preview (`npm run preview`).
* [ ] Identificado o IP local (Network URL) correto para o Wi-Fi local.
* [ ] Celular do testador conectado **na mesma rede Wi-Fi** e com o cache do navegador redefinido.
* [ ] Roteiro impresso ou disponível em tela secundária.

---

## 3. Roteiro Passo a Passo da Sessão (60 Minutos)

### A. Introdução & Aquecimento [00 - 10 Min]
* **Instrução para o Facilitador:** Explique de forma calma que o aplicativo foi criado especificamente para prestadores autônomos e que o objetivo é testar a facilidade dele e não do usuário.
* **Script de Abertura:** *"Hoje vamos fazer um ensaio rápido de 5 passos para simular como você utilizaria o Aferix no seu dia a dia desde fechar com o cliente até terminar o trabalho em campo."*

### B. Passo 1 — Cadastro de Cliente [10 - 20 Min]
* **Tarefa para o Usuário:** Peça para ele cadastrar um cliente com quem ele costuma trabalhar com frequência.
* **O que Observar:** 
  * Ele teve dificuldades em encontrar onde cadastrar o cliente?
  * Ele hesitou ao preencher o número de telefone ou endereço?
  * Ele percebeu que havia um campo de controle de limite de crédito?

### C. Passo 2 — Criação de Orçamento & Escopo [20 - 30 Min]
* **Tarefa para o Usuário:** Crie um orçamento para um conserto rápido de fiação/encanamento de R$ 400. Inserir custos de R$ 100 de cabos/conectores e R$ 30 de deslocamento.
* **O que Observar:**
  * Os campos monetários foram fáceis de digitar?
  * Ele percebeu a variação instantânea da lucratividade e margem ao inserir os custos?
  * O visual Dark Premium do Aferix permaneceu legível sob a luz?

### D. Passo 3 — Visualização da Proposta & Aprovação [30 - 40 Min]
* **Tarefa para o Usuário:** Gerar a prévia do orçamento, conferir os totais e aprovar a proposta para liberar o início do trabalho em campo.
* **O que Observar:**
  * Ele elogiou ou achou confusa a proposta técnica gerada?
  * O botão de autorização/aprovação estava posicionado intuitivamente na tela?

### E. Passo 4 — Execução Operacional & Evidência Offline [40 - 50 Min]
* **Tarefa para o Usuário:** Colocar o celular em Modo Avião (offline). Transicionar a ordem de serviço para "Em Execução", registrar um evento e tirar uma foto fictícia de evidência.
* **O que Observar:**
  * O app acusou travamento ou erro ao entrar em modo offline?
  * A fila de uploads capturou a evidência com status "Pendente"?
  * Desativando o modo avião, a fila de uploads foi processada de forma silenciosa?

### F. Passo 5 — Análise Financeira & Handoff [50 - 60 Min]
* **Tarefa para o Usuário:** Acessar o menu lateral, consultar a lucratividade real acumulada na aba de Relatórios e exportar um backup local de segurança.
* **O que Observar:**
  * Os números consolidados bateram com as somas reais do orçamento executado?
  * Ele conseguiu baixar o arquivo JSON de backup sem dificuldades?

---

## 4. Governança e Feedback do Teste

### Perguntas Neutras (Que Não Induzem Respostas):
1. *"O que você acha que significa a cor cinza/amarela exibida no card do orçamento?"*
2. *"Se eu não estivesse aqui hoje, qual seria o seu próximo clique na tela de execução?"*
3. *"Como você costuma enviar orçamentos hoje para os seus clientes, e como essa proposta PDF se compara com o seu modelo?"*

### Como Registrar Bugs e Fricções:
* **Fricção:** Anote cada hesitação superior a 5 segundos na ficha técnica de observações (ex: "Hesitou 8 segundos para achar o botão de custos").
* **Bugs:** Registre no console de telemetria `[PilotMetrics]` as falhas e salve um print do layout móvel quebrado.

---

## 5. Critérios de Interrupção & Sucesso

### Critérios de Sucesso do Ensaio:
1. O usuário completa o cadastro, orçamento, OS e conclusão de serviço sem o facilitador apontar cliques.
2. Nenhum erro de renderização silencioso ou quebra de tipo no Dexie local.
3. Consistência idêntica nas contas de lucros reais.

### Critérios de Interrupção Crítica (Parada Geral):
* Perda de dados ou apagamento espontâneo de orçamentos criados ao recarregar a tela.
* Falha sistemática ao processar a fila de evidências em segundo plano.
* Travamentos permanentes da interface de visualização.

---

## 6. Decisão Pós-Teste
Se o usuário conseguir completar o ciclo com menos de 3 hesitações estruturais e sem nenhum bug de interrupção, o Aferix está autorizado a expandir o piloto para mais prestadores autônomos.
