# Prompt para Gemini CLI — corrigir quebra visual do menu e layout do Aferix

## Contexto

O Aferix acabou de passar por uma mudança estratégica de fluxo:

Cliente → Orçamento → OS/Serviço → Pagamento → Resultado financeiro

A mudança de direção está correta, mas após a última alteração o visual quebrou no menu/layout mobile.

Na captura enviada, aparecem problemas graves:

- logo duplicado;
- nome AFERIX e AFERIXPROFISSIONAL desalinhados;
- textos colados sem espaçamento, por exemplo `InícioResumo e ações rápidas`;
- itens de menu sem hierarquia visual;
- menu lateral/modal com largura e espaçamentos ruins;
- navegação com aparência quebrada;
- cards e textos começando muito próximos da borda;
- scroll lateral/estrutura visual parecendo fora do container;
- identidade dark premium comprometida;
- o app parece estar renderizando labels, subtítulos e grupos sem separação adequada.

## Objetivo

Corrigir a quebra visual SEM reconstruir o app inteiro.

O objetivo é estabilizar o layout para publicação/beta, mantendo:

- tema dark premium;
- amarelo como cor principal;
- simplicidade;
- fluxo centrado em Cliente → Orçamento → Serviço → Pagamento;
- foco em publicação pública.

## Regras importantes

Não faça redesign completo.
Não recrie toda a navegação do zero se não for necessário.
Não reintroduza calculadoras técnicas.
Não reintroduza Atendimento como fluxo principal.
Não adicione funcionalidades novas.
Não mexa em cloud, automações, marketplace ou dashboards avançados.

A tarefa é uma correção cirúrgica de UI/UX.

## Diagnóstico esperado

Procure os componentes responsáveis por:

- menu lateral;
- sidebar;
- mobile navigation;
- header;
- logo/app brand;
- layout principal;
- dashboard/home;
- itens de navegação;
- cards iniciais;
- espaçamento global;
- classes Tailwind quebradas;
- strings concatenadas sem espaço;
- wrappers sem `gap`, `space-y`, `padding`, `flex`, `grid` ou largura correta.

## Correções obrigatórias

### 1. Corrigir logo/branding

Deve haver apenas uma apresentação clara da marca no menu:

- logo único;
- nome `Aferix`;
- opcionalmente subtítulo curto: `Gestão financeira para serviços`.

Remover duplicação visual de logo e textos como `AFERIXPROFISSIONAL` colados.

### 2. Corrigir itens de navegação

Os itens devem ter estrutura clara:

- título;
- subtítulo pequeno opcional;
- espaçamento entre título e subtítulo;
- padding lateral;
- altura mínima confortável;
- estado ativo em amarelo discreto.

Exemplo visual esperado:

Início
Resumo e ações rápidas

Clientes
Gestão de clientes

Orçamentos
Propostas e valores

Serviços
OS em execução

Financeiro
Receitas, custos e lucro

### 3. Remover texto concatenado

Corrigir qualquer renderização do tipo:

- `InícioResumo e ações rápidas`
- `ClientesGestão de clientes e serviços`
- `FinanceiroReceitas e custos`
- `MenuMais ferramentas`

Isso indica que título e descrição estão sendo renderizados sem bloco, sem espaçamento ou sem container adequado.

### 4. Corrigir menu mobile

O menu mobile deve:

- ocupar largura controlada;
- ter padding interno adequado;
- não cortar conteúdo;
- não deixar textos colados na borda;
- permitir scroll vertical se necessário;
- manter botão de fechar bem posicionado;
- ter fundo escuro consistente;
- ter bordas/sombra premium.

### 5. Corrigir dashboard inicial

A tela inicial deve continuar simples:

- título forte: `Controle seu lucro`;
- subtítulo curto;
- botão principal: `Novo orçamento`;
- bloco de fluxo operacional;
- cards de atenção sem excesso visual.

Não deixar cards colados nas bordas.

### 6. Corrigir espaçamento global

Revisar:

- padding horizontal mobile;
- gap entre blocos;
- margem superior após menu/header;
- line-height;
- contraste;
- overflow horizontal;
- largura máxima de containers.

Não deve haver scroll horizontal inesperado.

## Critérios de aceite

Após corrigir:

1. O menu não pode mais mostrar logo duplicado.
2. Nenhum item de navegação pode aparecer com título e descrição colados.
3. O menu mobile deve parecer premium e organizado.
4. O botão `Novo orçamento` deve continuar como CTA principal.
5. O fluxo deve continuar sem `Atendimento` como item principal.
6. A dashboard deve parecer limpa, calma e publicável.
7. Não pode haver overflow horizontal.
8. O build deve passar.

## Testes obrigatórios

Rodar:

```bash
npm run typecheck
npm test
npm run build
```

Se existir script de QA visual:

```bash
npm run visual:qa
```

## Entrega esperada

Ao finalizar, gere um relatório com:

- arquivos alterados;
- causa provável da quebra visual;
- correções aplicadas;
- pontos ainda pendentes;
- resultado dos testes;
- confirmação de que o fluxo oficial continua sendo:

Cliente → Orçamento → OS/Serviço → Pagamento → Resultado financeiro
