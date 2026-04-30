# OrçaOS — fases de execução até publicação na Play Store

Este documento organiza o trabalho em fases fechadas para levar o OrçaOS do estado atual até uma primeira publicação/teste na Google Play Store.

## Princípio de trabalho

A partir desta etapa, o projeto deve evitar expansão descontrolada.

Regra principal:

```text
Não adicionar módulos grandes novos antes de consolidar o fluxo MVP publicável.
```

O objetivo é chegar a uma versão funcional, estável, bonita o suficiente e testável por usuários reais.

## Fase 0 — Congelamento de escopo do MVP

Status: próxima fase imediata.

Objetivo:

Definir exatamente o que entra na primeira versão publicável.

Entra no MVP:

- tela inicial;
- cálculos essenciais organizados por taxonomia nova;
- levantamento guiado;
- itens técnicos;
- orçamento/proposta;
- proposta pública do cliente;
- texto para WhatsApp;
- prévia/PDF da proposta;
- clientes/OS;
- perfil profissional/empresa;
- backup local;
- configurações básicas.

Não entra no MVP inicial:

- backend em nuvem;
- login real;
- pagamentos internos;
- marketplace;
- catálogo online automático;
- OrçaOS Cliente como app separado;
- múltiplos usuários;
- estoque completo com baixa automática avançada;
- conformidade normativa automática total.

Critério de conclusão:

- escopo documentado;
- taxonomia aprovada;
- nenhuma tela principal sem função mínima;
- backlog de pós-MVP separado.

## Fase 1 — Reorganização da taxonomia dos cálculos

Objetivo:

Corrigir a bagunça atual de categorias e transformar os cálculos em uma estrutura profissional, previsível e escalável.

Entregas:

- nova árvore de categorias;
- classificação por núcleo, profissão e especialidade;
- definição de cálculos gratuitos;
- definição de cálculos Pro;
- nomes consistentes;
- ordem de exibição coerente;
- remoção de categorias vagas como “obras” sem subdivisão.

Critério de conclusão:

- taxonomia implementada na tela;
- usuário entende onde encontrar cada cálculo;
- elétrico, hidráulico, pintura, construção civil, refrigeração, automação, eletrônica e motores não ficam misturados.

## Fase 2 — Estabilização técnica

Objetivo:

Fazer o app compilar e funcionar sem erros.

Checklist:

- `npm run typecheck` sem erro;
- `npm run build` sem erro;
- remover imports quebrados;
- corrigir componentes duplicados;
- corrigir tipos TypeScript;
- revisar localStorage;
- validar backup/restauração;
- testar em tela mobile;
- testar em desktop.

Critério de conclusão:

- build limpo;
- app abre localmente;
- navegação principal funciona;
- nenhuma tela crítica quebra.

## Fase 3 — Fluxo MVP ponta a ponta

Objetivo:

Garantir que o usuário consiga fazer um ciclo completo de trabalho.

Fluxo obrigatório:

```text
Configurar perfil profissional
→ cadastrar cliente/OS
→ fazer levantamento
→ usar cálculo ou item guiado
→ mandar para orçamento
→ criar proposta pública
→ copiar texto para WhatsApp
→ gerar prévia/PDF
→ salvar backup local
```

Critério de conclusão:

- fluxo testado manualmente;
- resultado compreensível;
- proposta não mostra custo interno;
- materiais comprados pelo cliente ficam separados;
- cliente recebe texto e PDF utilizáveis.

## Fase 4 — Design e experiência mínima profissional

Objetivo:

Melhorar estética e organização sem refazer o app inteiro.

Prioridades:

- corrigir telas visualmente bagunçadas;
- melhorar menus superiores;
- reduzir excesso de blocos;
- padronizar cards;
- padronizar tipografia;
- melhorar contraste;
- melhorar botões e espaçamentos;
- deixar modo claro/preto/verde coerente;
- melhorar PDF/preview da proposta.

Critério de conclusão:

- app não parece protótipo grosseiro;
- telas principais são legíveis no celular;
- proposta visual é apresentável ao cliente;
- não há informação demais em uma única tela.

## Fase 5 — Política, privacidade e preparação Play Store

Objetivo:

Preparar exigências da Play Store e evitar rejeição.

Checklist:

- definir nome final do app;
- definir package name;
- gerar ícone final;
- gerar screenshots;
- escrever descrição curta;
- escrever descrição longa;
- criar política de privacidade pública;
- revisar dados coletados;
- preencher Segurança dos Dados;
- revisar permissões Android;
- evitar permissões sensíveis desnecessárias;
- definir se há anúncios ou não no MVP;
- definir se há compras/assinaturas no MVP ou apenas depois;
- preparar conta de desenvolvedor;
- configurar Play App Signing;
- criar release interna/fechada.

Critério de conclusão:

- ficha da loja pronta;
- política de privacidade pronta;
- APK/AAB preparado;
- permissões justificadas;
- track de teste configurada.

## Fase 6 — Teste fechado / validação real

Objetivo:

Testar com usuários reais antes da produção.

Checklist:

- selecionar testadores;
- publicar em teste interno/fechado;
- coletar feedback;
- testar em celulares diferentes;
- testar fluxo de orçamento real;
- testar backup;
- testar PDF;
- testar WhatsApp;
- corrigir bugs críticos.

Observação:

Contas pessoais novas na Play Console podem exigir teste fechado com pelo menos 12 testadores por 14 dias contínuos antes de solicitar produção.

Critério de conclusão:

- testadores conseguem instalar;
- fluxo principal validado;
- bugs críticos corrigidos;
- feedback documentado.

## Fase 7 — Publicação inicial

Objetivo:

Publicar primeira versão com escopo controlado.

Checklist:

- gerar build final;
- subir Android App Bundle;
- revisar ficha da loja;
- revisar Segurança dos Dados;
- revisar política de privacidade;
- enviar para revisão;
- monitorar rejeições/avisos;
- corrigir se necessário;
- publicar gradualmente.

Critério de conclusão:

- app disponível na Play Store;
- versão inicial rastreada;
- feedback real entrando;
- próximo ciclo definido.

## Fase 8 — Pós-publicação

Objetivo:

Evoluir com base em uso real, sem perder estabilidade.

Possíveis melhorias pós-MVP:

- cálculos com justificativa avançada;
- mais módulos Pro;
- assinatura/licença;
- backup em nuvem;
- link público de proposta;
- QR Code;
- OrçaOS Cliente web/app;
- catálogo online;
- estoque completo;
- relatórios mais profissionais;
- integração com WhatsApp/e-mail;
- importação/exportação avançada.

## Ordem recomendada a partir de agora

1. Fechar taxonomia dos cálculos.
2. Implementar a taxonomia na interface.
3. Rodar build/typecheck.
4. Corrigir erros.
5. Testar fluxo MVP completo.
6. Refinar design das telas principais.
7. Preparar documentação Play Store.
8. Gerar build Android.
9. Teste fechado.
10. Publicação.
