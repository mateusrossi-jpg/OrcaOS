# OrçaOS — Fechamento das fases atuais

Data: 2026-05-02

Este documento fecha o ciclo técnico atual do OrçaOS para validação no workspace.

## Fases fechadas nesta rodada

### 1. Coerência visual base

Status: fechado para validação.

- Tema preto/verde consolidado como direção visual do app.
- Telas principais reorganizadas para reduzir blocos brancos e azuis indevidos.
- Branco mantido como exceção para documento, prévia, PDF e áreas que representam papel.
- Cards, abas e estados ativos seguem o padrão escuro/verde.

Validação pendente: revisão manual em celular real, porque pequenas quebras visuais dependem de viewport, fonte e dados preenchidos.

### 2. Taxonomia dos cálculos

Status: fechado para V1.

- Cálculos organizados por setores técnicos.
- Removida a lógica confusa de misturar profissão, área e lista solta de fórmulas no mesmo nível.
- Novos módulos entraram em áreas compatíveis:
  - elétrica residencial;
  - financeiro avançado;
  - construção avançada;
  - hidráulica avançada;
  - conversores avançados;
  - refrigeração;
  - motores;
  - transformadores;
  - solar;
  - diagnóstico técnico.

Regra mantida: cálculo não é uma fórmula isolada; deve apoiar decisão técnica, levantamento, orçamento e relatório.

Proteção adicionada:

- teste automatizado garante abas principais únicas;
- teste automatizado garante setores conectados a módulos existentes;
- teste automatizado garante módulos ativos apontando para workspace/regra implementada;
- teste automatizado garante módulos indisponíveis como `Em breve`.

### 3. Expansão dos cálculos

Status: fechado como implementação inicial.

Foram implementados assistentes com poucos campos, resultado direto, fórmula e orientação prática.

Cobertura adicionada:

- elétrica residencial: 9 assistentes;
- financeiro avançado: 9 assistentes;
- construção avançada: 9 assistentes;
- hidráulica avançada: 8 assistentes;
- conversores avançados: 10 conversores;
- refrigeração/climatização;
- motores/comandos;
- transformadores;
- solar;
- diagnóstico técnico;
- rebobinagem como base segura/experimental.

Observação: cálculos normativos avançados continuam fora do MVP até validação técnica específica.

### 4. Performance inicial

Status: fechado.

- Workspaces pesados foram separados com carregamento sob demanda.
- O bundle inicial caiu para aproximadamente 232 kB.
- O aviso de bundle grande do Vite foi removido.

### 5. Testabilidade dos cálculos

Status: fechado para MVP.

- O motor core ganhou funções explícitas para margem alvo e markup.
- O workspace de expansão passou a usar o core para queda de tensão, cabo e disjuntor.
- Testes cobrem cenários de elétrica, eletroduto, financeiro, hidráulica, construção, pintura, parcelamento e conversores.

Estado atual:

```txt
6 arquivos de teste
56 testes passando
```

### 6. Persistência local-first

Status: fechado para validação inicial.

- Testes cobrem capturas de cálculo salvas no navegador.
- Testes cobrem clientes, ordens de serviço e OS ativa.
- Testes cobrem backup local: coleta, parse, resumo, merge e replace.
- Testes cobrem perfil profissional: criação, salvamento, fallback e reset de IDs.
- Testes cobrem JSON inválido e ambiente sem `window`.
- Storages retornam valores seguros quando os dados locais estão vazios ou corrompidos.

Estado atualizado:

```txt
11 arquivos de teste
75 testes passando
```

## Validação técnica executada

Comandos executados:

```bash
npm run typecheck
npm test
npm run build
```

Resultado:

```txt
typecheck passou
test passou
build passou
```

## Fases que viram próxima rodada

Estas fases não bloqueiam a validação atual, mas devem guiar o próximo ciclo.

### 1. Revisão visual em aparelho real

- testar em celular;
- revisar overflow;
- revisar altura de modais;
- revisar densidade dos cards;
- revisar toque em botões e abas;
- ajustar telas com dados reais preenchidos.

### 2. Simplificação prática do dia a dia

- reduzir caminhos duplicados;
- consolidar ações de levantamento, orçamento e relatório;
- melhorar o fluxo de “cliente/OS ativo”;
- transformar catálogo, fornecedor e estoque em hierarquia mais clara.

### 3. Login e backup

- manter bloqueio local e backup local como base inicial;
- tratar login Google como próxima decisão de produto;
- só implementar Google OAuth/Drive real quando houver estratégia de consentimento, privacidade, escopo e publicação definida.

### 4. Testes profundos de fórmula

- aumentar testes por módulo profissional;
- adicionar casos extremos;
- validar arredondamento;
- validar mensagens de erro;
- validar envio para levantamento, orçamento e relatório.

## Critério de fechamento

Esta fase está fechada porque:

- o app compila;
- os testes passam;
- a navegação principal está mantida;
- a expansão de cálculos está integrada;
- a taxonomia V1 está coerente;
- a performance inicial foi melhorada;
- a persistência local principal tem cobertura de teste;
- as próximas pendências estão documentadas como evolução, não como bloqueio técnico imediato.
