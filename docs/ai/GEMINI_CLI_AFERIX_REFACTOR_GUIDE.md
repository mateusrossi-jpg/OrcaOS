# Guia para Gemini CLI — Refatoração Aferix

Este arquivo deve ser usado como referência operacional no VS Code/Gemini CLI durante a refatoração do Aferix.

## Contexto do projeto

O projeto anteriormente chamado OrcaOS está sendo refatorado para **Aferix**.

O Aferix deve ser tratado como um **ERP financeiro e operacional local-first para autônomos e pequenos prestadores de serviço**.

O foco atual NÃO é mais ser um app técnico de elétrica, hidráulica, obras ou calculadoras profissionais gerais. O foco principal é:

- controle financeiro do autônomo;
- propostas/orçamentos;
- clientes;
- atendimentos;
- receitas;
- custos;
- lucro real;
- catálogo de serviços e itens;
- relatórios comerciais;
- backup local;
- preparação para publicação Android.

## Regras obrigatórias

1. Manter o app compilável após cada bloco de alteração.
2. Rodar validação sempre que possível:

```bash
npm run typecheck
npm run build
```

3. Não atualizar dependências principais.
4. Não rodar:

```bash
npm audit fix --force
```

5. Não alterar versões principais de React, Vite, TypeScript ou Capacitor.
6. Não transformar o app em um ERP pesado.
7. Não reintroduzir calculadoras técnicas de elétrica, motores, hidráulica, obras, solar ou bobinagem no fluxo principal.
8. Não duplicar conteúdos em várias abas.
9. Cada conteúdo deve ter um único local de acesso claro.
10. Preservar arquitetura local-first/offline-first.

## Prioridade imediata

Antes de continuar a refatoração visual, corrigir qualquer problema estrutural que possa quebrar o build.

Verificar especialmente:

- imports duplicados;
- funções duplicadas;
- componentes declarados duas vezes;
- nomes antigos conflitantes entre OrcaOS e Aferix;
- telas com conteúdos repetidos;
- rotas/abas que apontam para áreas legadas;
- referências visuais antigas como teal/cyan quando a identidade atual é amarelo.

## Ponto crítico já identificado

No arquivo:

```text
src/app/AppOrcaNextOrganized.tsx
```

Verificar se existe conflito entre:

```ts
import { getSectorForModule } from './utils/moduleHelpers';
```

e uma função local chamada:

```ts
function getSectorForModule(...)
```

Se existir duplicidade, manter apenas uma fonte de verdade.

Preferência: manter a função utilitária em `src/app/utils/moduleHelpers.ts` e remover a função local, desde que isso não quebre a lógica.

## Direção de produto

O Aferix deve responder principalmente às perguntas:

- Quanto entrou?
- Quanto saiu?
- Quanto sobrou?
- Quanto devo cobrar?
- Qual serviço está pendente?
- Qual cliente/atendimento está ativo?
- Qual proposta foi enviada/aprovada?
- Qual é meu lucro real?
- O que preciso comprar?
- O que preciso registrar para não perder informação?

## Estrutura desejada das abas

### Dashboard

Resumo direto da operação financeira:

- lucro líquido do mês;
- fluxo de caixa;
- contas a receber;
- despesas;
- atendimentos em andamento;
- ações rápidas.

### Propostas

Local único para orçamento/proposta.

Deve conter:

- itens de serviço;
- materiais;
- custos;
- desconto;
- deslocamento;
- margem;
- valor final;
- status da proposta;
- conversão para atendimento/OS apenas quando fizer sentido.

### Clientes / Atendimentos

Local único para gestão de clientes e atendimentos.

Evitar replicar o mesmo atendimento em todas as telas de forma pesada.

Pode haver um card compacto de contexto ativo, mas não deve poluir todas as abas.

### Financeiro

Local principal para receitas, despesas, custos, lucro, fluxo de caixa e visão do mês.

Não misturar com calculadoras técnicas.

### Catálogo

Catálogo local de serviços, materiais e itens de apoio à proposta.

Não virar ERP pesado de estoque neste momento.

### Compras

Lista de materiais que o cliente ou o profissional precisa comprar.

Não duplicar catálogo nem proposta.

### Relatórios

Relatórios comerciais e operacionais.

Evitar foco em laudo técnico complexo nesta fase.

### Base técnica

Se permanecer, deve ser opcional e discreta.

Ela deve servir apenas como apoio ao atendimento/proposta, não como centro do app.

### Licença

Tela de Free/Pro simples.

Remover comparativos duplicados.

Não exibir cobrança falsa.

### Configurações

Perfil profissional, backup, segurança, preferências e informações legais.

## Identidade visual

A identidade atual escolhida é:

- fundo preto/grafite;
- cards escuros;
- amarelo como cor principal;
- visual premium, limpo e financeiro;
- sem excesso de textos explicativos;
- sem teal/cyan como cor principal;
- botões bem posicionados;
- espaçamento consistente;
- fontes legíveis;
- cada aba com hierarquia clara.

Cuidado: o amarelo deve ser usado como principal/acento de seleção, mas sem saturar todas as áreas.

## Limpeza conceitual

Remover ou isolar referências antigas quando não forem mais necessárias:

- OrcaOS em textos públicos;
- calculadoras técnicas fora do fluxo financeiro;
- elétrica residencial;
- motores;
- bobinagem;
- hidráulica avançada;
- obras avançadas;
- solar;
- diagnósticos técnicos complexos;
- menus com escopo profissional amplo demais.

Se algum código legado ainda for necessário para não quebrar o app, manter temporariamente, mas esconder do fluxo principal e marcar como pendência futura.

## Critérios de aceite

Ao finalizar cada ciclo, informar:

1. Arquivos alterados.
2. O que foi corrigido.
3. O que foi removido ou isolado.
4. Resultado de:

```bash
npm run typecheck
npm run build
```

5. Pendências restantes.

## Ordem recomendada de execução

### Etapa 1 — Estabilidade

- Corrigir duplicidades de import/função.
- Garantir typecheck/build.
- Evitar mexer no visual nesta etapa.

### Etapa 2 — Arquitetura de navegação

- Confirmar que cada aba tem função única.
- Remover duplicidades evidentes.
- Evitar conteúdo repetido em Store/Licença, Configurações e Mais recursos.

### Etapa 3 — Limpeza de legado técnico

- Esconder ou remover módulos técnicos fora do foco financeiro.
- Preservar apenas o que apoia proposta, custo, lucro e atendimento.

### Etapa 4 — Refinamento visual

- Padronizar amarelo principal.
- Remover teal/cyan remanescente.
- Ajustar espaçamentos, cards, botões, fontes e responsividade.

### Etapa 5 — Preparação para teste

- Rodar build.
- Revisar fluxo mobile.
- Garantir que o usuário novo entende rapidamente:
  - criar atendimento;
  - criar proposta;
  - registrar custo;
  - ver lucro;
  - exportar/gerar relatório;
  - fazer backup.

## Instrução final para o Gemini CLI

Trabalhe em ciclos pequenos e seguros.

Não tente resolver tudo de uma vez.

Priorize primeiro estabilidade, depois clareza de produto, depois visual.

O objetivo é transformar o Aferix em um app publicável, financeiro, limpo, confiável e útil para autônomos.