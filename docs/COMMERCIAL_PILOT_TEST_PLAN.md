# Plano de Teste do Piloto Comercial — Aferix

## 1. Perfil Ideal do Primeiro Usuário
* **Segmento:** Prestadores de serviços técnicos autônomos (Eletricistas, Encanadores, Técnicos de Ar Condicionado, Pintores).
* **Características:**
  * Trabalham majoritariamente em campo, utilizando smartphones de médio porte.
  * Realizam visitas técnicas onde a conectividade de rede (3G/4G) pode ser instável ou inexistente (por exemplo, subsolos, áreas rurais).
  * Possuem dificuldades em acompanhar o lucro real de seus atendimentos devido a custos imprevistos de transporte e materiais.

---

## 2. Cenários de Teste Guiados

### Cenário de Teste 1: Orçamento Simples
* **Objetivo:** Criar um orçamento rápido para um serviço rápido de manutenção sem complexidade.
* **Passos:**
  1. Acessar o app e clicar em "+ Novo" ou "Novo orçamento" na tela inicial.
  2. Preencher o título (ex: "Conserto de Torneira").
  3. Preencher o Valor Cobrado (ex: R$ 150).
  4. Adicionar um item de custo de materiais de R$ 30 nas seções de custos.
  5. Clicar em "Salvar Rascunho".
* **Resultado Esperado:** O orçamento deve aparecer listado no Histórico com status "Rascunho", exibindo lucro real de R$ 120 e a margem calculada corretamente.

### Cenário de Teste 2: Orçamento com Execução
* **Objetivo:** Transicionar um orçamento aprovado para execução operacional.
* **Passos:**
  1. Clicar em um orçamento com status "Rascunho" no Histórico.
  2. Alterar o status para "Enviado" e em seguida clicar em "Autorizar".
  3. Com o orçamento autorizado, iniciar o fluxo de execução.
* **Resultado Esperado:** O status muda para "Em Execução" e a interface de campo é liberada.

### Cenário de Teste 3: Execução com Evidência
* **Objetivo:** Adicionar evidência fotográfica durante o atendimento operacional.
* **Passos:**
  1. No Workspace de Execução, clicar no botão de "Adicionar Evidência/Tirar Foto".
  2. Confirmar a inclusão da foto.
* **Resultado Esperado:** Um evento de foto é anexado à timeline do atendimento e processado localmente.

### Cenário de Teste 4: Uso Offline
* **Objetivo:** Testar a robustez do app em locais sem sinal de internet.
* **Passos:**
  1. Colocar o dispositivo móvel em Modo Avião.
  2. Acessar o app e navegar pelas abas (Histórico, Catálogo, Clientes).
  3. Executar o início ou pausa de uma ordem de serviço em andamento.
  4. Capturar uma evidência fotográfica.
* **Resultado Esperado:** Nenhuma mensagem de erro técnico ou travamento. O app retém os status em cache local no Dexie e enfileira a evidência na fila pendente.

### Cenário de Teste 5: Reconexão e Sincronização
* **Objetivo:** Validar a sincronização dos dados ao restabelecer o sinal.
* **Passos:**
  1. Retirar o dispositivo do Modo Avião.
  2. Acessar o app e navegar para forçar a reconexão.
* **Resultado Esperado:** A fila de evidências processa as fotos pendentes de envio e o Version Vector do dispositivo é atualizado de forma transparente.

### Cenário de Teste 6: Relatório Financeiro
* **Objetivo:** Apurar os resultados gerais do período no painel de relatórios.
* **Passos:**
  1. Acessar a tela de "Relatórios" do menu principal.
  2. Analisar o faturamento bruto, custos acumulados e lucro real.
* **Resultado Esperado:** Os totais numéricos refletem exatamente a soma dos orçamentos autorizados e finalizados.

### Cenário de Teste 7: Histórico de Atendimentos
* **Objetivo:** Buscar e validar a persistência de atendimentos passados.
* **Passos:**
  1. Navegar até a tela de Histórico.
  2. Utilizar as pílulas de filtro ("Todos", "Em andamento", "Finalizados").
* **Resultado Esperado:** Busca instantânea e renderização correta de cards usando o padrão Dark Premium do Aferix.

---

## 3. Coleta de Feedback & Métricas

### Perguntas para Feedback:
1. "Em uma escala de 1 a 5, quão confiante você se sentiu de que seus dados de custos estavam corretos?"
2. "Houve algum momento em que o aplicativo travou ou não respondeu ao toque em campo?"
3. "A tela de execução durante o serviço ajudou você a focar nas etapas essenciais ou pareceu burocrática?"
4. "O envio da proposta via PDF gerou um visual profissional que agradou o seu cliente?"

### Métricas Observáveis locais:
* **Tempo de Criação:** Média de minutos para criar o primeiro orçamento (ideal: < 3 minutos).
* **Frequência de Uso:** Vezes em que o app foi aberto em modo offline (registrado localmente pelo `PilotUsageMetrics`).
* **Taxa de Drops de Rede:** Quantidade de reconnects capturados durante a sessão operacional do técnico.

### Pontos de Dor a Observar:
* Dificuldade em preencher centavos nos campos de entrada monetária.
* Letras ou botões que parecem pequenos quando expostos a luz solar intensa.
* Lerdeza no carregamento de listas longas de catálogo.

---

## 4. Governança de Bugs e Decisão

### Bugs Críticos (Bloqueiam o Piloto):
* Perda de dados ou falhas de salvamento no IndexedDB/Dexie.
* Diferença de valores matemáticos no cálculo de lucro real entre o form e o relatório.
* Travamentos permanentes que exigem forçar o fechamento do app no Android/iOS.

### Bugs Aceitáveis no Piloto:
* Pequenas demoras no carregamento de ícones secundários offline.
* Avisos de sync em progresso que permanecem na barra de status por alguns segundos após a reconexão.
* Textos ou traduções secundárias ligeiramente desalinhados.

### Como Reportar Problemas:
Envie uma captura de tela (print) ou copie o log rápido de telemetria localizado em *Configurações > Segurança > Telemetria de Uso* diretamente para o time de suporte via canal oficial.

### Como Decidir se Avança para Lançamento Aberto:
Se em 14 dias de piloto controlado com 5 prestadores não houver bugs críticos (perda de dados ou erros de cálculo), o Aferix avançará para a fase de Beta Público.
