# AFERIX — Prompt de Auditoria do Uso Sequencial do App

Use este prompt no Gemini CLI para revisar o fluxo real de uso do Aferix, corrigir perda de contexto entre telas e reorganizar a ordem operacional do orçamento.

```text
Atue como Product Designer Senior, UX Researcher e Engenheiro Front-end especialista em fluxo operacional mobile-first.

O Aferix ainda apresenta problemas graves de continuidade de fluxo durante o uso real.

Problema principal:
Ao mudar de tela durante o fluxo de trabalho, o app perde contexto visual e operacional. O usuário precisa “procurar onde estava”, o que quebra a experiência.

Além disso:
- valores financeiros aparecem cedo demais;
- prioridades do fluxo não estão claras;
- a ordem das informações não acompanha o raciocínio real do usuário;
- telas não respeitam continuidade operacional;
- o sistema ainda parece conjunto de telas soltas, não um fluxo integrado.

Objetivo desta rodada:
Realizar uma auditoria completa de uso sequencial do app, simulando uso real de um autônomo criando atendimento, orçamento, revisão e finalização.

────────────────────────
1. TESTE DE FLUXO REAL
────────────────────────

Simular o seguinte uso completo:

1. Abrir app
2. Entrar na Home
3. Criar cliente
4. Criar atendimento
5. Iniciar orçamento
6. Adicionar itens
7. Inserir custos
8. Revisar orçamento
9. Gerar PDF
10. Voltar para atendimentos
11. Abrir cliente novamente
12. Abrir financeiro
13. Abrir relatório

Durante o teste, identificar:

- pontos onde o usuário “se perde”;
- mudanças de tela sem continuidade;
- telas que não retornam ao local correto;
- contexto operacional perdido;
- excesso de cliques;
- informações aparecendo cedo demais;
- seções fora de ordem lógica;
- campos que interrompem o raciocínio natural;
- botões que levam para telas incorretas;
- abas que abrem em etapa errada;
- redundâncias entre menu lateral e botões internos.

────────────────────────
2. CONTEXTO OPERACIONAL
────────────────────────

O app deve sempre preservar contexto.

Exemplo:
Se o usuário estava trabalhando em:
Cliente João → Atendimento cozinha → Orçamento X

Ao mudar de tela:
- o sistema deve lembrar contexto atual;
- exibir contexto ativo no topo;
- facilitar retorno ao fluxo;
- evitar sensação de “reinício”.

O usuário não pode precisar:
- procurar orçamento novamente;
- procurar atendimento novamente;
- procurar cliente novamente;
- reconstruir mentalmente onde estava.

Adicionar ou corrigir persistência de contexto operacional.

────────────────────────
3. ORDEM CORRETA DAS PRIORIDADES
────────────────────────

O fluxo atual mostra valores financeiros cedo demais.

Isso está errado.

O usuário primeiro pensa:
1. cliente;
2. problema;
3. serviço/atendimento;
4. materiais/itens;
5. execução;
6. custos;
7. margem/lucro;
8. revisão;
9. PDF/finalização.

Corrigir ordem mental do sistema.

Os custos, totais e valores NÃO devem dominar o início do fluxo.

Valores devem aparecer:
- depois dos itens;
- depois da definição do serviço;
- depois do entendimento do orçamento;
- de forma progressiva e contextual.

────────────────────────
4. REESTRUTURAR FLUXO DE ORÇAMENTO
────────────────────────

Fluxo ideal:

ETAPA 1 — Cliente
- selecionar cliente;
- criar cliente;
- visualizar contexto do cliente.

ETAPA 2 — Atendimento
- problema;
- necessidade;
- descrição;
- prioridade;
- endereço;
- agendamento.

ETAPA 3 — Itens
- serviços;
- materiais;
- quantidades;
- observações.

ETAPA 4 — Custos
- custo de material;
- custo operacional;
- deslocamento;
- impostos estimados;
- margem;
- lucro.

ETAPA 5 — Revisão
- revisão geral;
- escopo final consolidado;
- conferência;
- resumo visual;
- validação antes de salvar/PDF.

ETAPA 6 — PDF / Finalização
- gerar PDF;
- salvar;
- compartilhar;
- marcar status.

A aba “Escopo” não deve ser a primeira etapa.
Se existir, deve virar “Revisão” ou “Resumo final”.

────────────────────────
5. NOVO ORÇAMENTO
────────────────────────

Corrigir comportamento de “Novo orçamento”.

Hoje ele está abrindo em etapa errada ou indo para uma área genérica de Orçamentos.

Comportamento correto:
- “Novo orçamento” deve iniciar o wizard na etapa Cliente;
- se já houver cliente/atendimento ativo, sugerir usar esse contexto;
- caso contrário, permitir criar ou selecionar cliente;
- depois seguir para Atendimento;
- depois Itens;
- depois Custos;
- depois Revisão;
- depois PDF/finalização.

Não abrir diretamente em “Escopo”.
Não abrir diretamente em valores.
Não abrir em tela que obrigue o usuário a procurar o começo do fluxo.

────────────────────────
6. NAVEGAÇÃO INTELIGENTE
────────────────────────

Ao trocar de tela:
- manter contexto ativo;
- lembrar aba anterior;
- lembrar etapa atual;
- permitir retorno rápido.

Adicionar, se necessário:
- breadcrumbs simples;
- barra de contexto;
- mini header contextual;
- botão “Continuar orçamento”; 
- botão “Voltar ao atendimento”.

Exemplo de contexto:
Cliente João > Atendimento Cozinha > Orçamento #002

A navegação deve respeitar o que o usuário estava fazendo.

────────────────────────
7. REVISAR TELAS QUEBRADAS OU DESALINHADAS
────────────────────────

Identificar telas onde:
- o usuário não entende o próximo passo;
- o foco visual está errado;
- existem informações demais;
- existem cards demais;
- os números aparecem cedo demais;
- existem abas redundantes;
- o usuário precisa pensar demais;
- o botão principal não representa a próxima ação lógica.

Simplificar.

Cada tela deve responder:
- Onde estou?
- O que estou fazendo?
- Qual é o próximo passo?
- Como volto ao contexto anterior?

────────────────────────
8. EXPERIÊNCIA MOBILE-FIRST
────────────────────────

Todo fluxo deve ser confortável no iPhone e Android.

Verificar:
- continuidade;
- leitura;
- posição dos CTAs;
- retorno;
- scroll excessivo;
- mudança brusca de contexto;
- excesso de informação na mesma tela;
- botões muito baixos ou difíceis de alcançar;
- abas que exigem procurar conteúdo.

O app deve parecer:
- guiado;
- lógico;
- progressivo;
- operacional;
- natural;
- simples.

────────────────────────
9. CRITÉRIOS DE ACEITE
────────────────────────

A rodada só estará correta se:

- o usuário não se perder ao trocar de tela;
- o sistema preservar contexto;
- o fluxo seguir raciocínio real do autônomo;
- custos não aparecerem cedo demais;
- orçamento iniciar por cliente;
- atendimento vier antes dos itens e valores;
- revisão final ficar no final;
- telas ficarem mais progressivas;
- o fluxo parecer integrado;
- o app parecer um sistema único e não telas separadas;
- a experiência mobile melhorar claramente;
- o build funcionar.

Não criar funcionalidades enormes novas.
Não adicionar complexidade desnecessária.
Não reescrever o app inteiro.

Priorizar:
- fluxo;
- continuidade;
- contexto;
- clareza;
- simplicidade operacional;
- beta estável.
```
