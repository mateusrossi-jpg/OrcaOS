# OrçaOS — Prompt Copilot: polimento visual global

Use este arquivo como instrução para o Copilot melhorar o visual global do OrçaOS sem refatoração pesada.

---

## Prompt

Leia primeiro:

```txt
docs/ai/README.md
docs/ai/ORCAOS_MVP_PUBLICATION_MASTER_PLAN.md
docs/ai/ORCAOS_MVP_POLISH_CHECKLIST.md
```

Estamos na fase de polimento visual global do MVP do OrçaOS.

Objetivo: melhorar o app inteiro com uma estética profissional, bonita, coerente e responsiva, mantendo a arquitetura atual e sem criar módulos novos.

O OrçaOS deve parecer uma ferramenta técnica de alto nível para uso real em campo: limpo, confiável, moderno, organizado e bom de usar no celular.

---

## Escopo visual

Pensar no app como um todo, incluindo:

- dashboard;
- tela Cálculos;
- cards de módulos;
- overlays/telas de cálculo;
- resultados;
- caixa `Como este cálculo é feito`;
- levantamento;
- orçamento;
- relatório/proposta;
- perfil/configurações;
- estados vazios;
- mensagens de erro, sucesso e orientação;
- botões e ações principais;
- responsividade mobile.

---

## Direção estética

Buscar uma linha visual:

```txt
profissional
moderna
limpa
responsiva
elegante
confiável
técnica
bem acabada
```

Evitar:

```txt
cores aleatórias
visual infantil
poluição visual
sombras exageradas
mudanças radicais
redesign total sem controle
```

---

## Sistema de cores

Consolidar uma paleta coerente para todo o app.

Direção recomendada:

```txt
fundo escuro elegante em slate/grafite
cards em superfície escura elevada
verde como cor principal de ação/confiança
azul como cor técnica/informativa
âmbar apenas para alerta/destaque moderado
vermelho apenas para erro/perigo
textos claros com bom contraste
textos secundários em cinza frio
bordas sutis
```

Se existirem variáveis CSS, reutilizar e organizar. Se necessário, criar tokens globais como:

```css
--orca-bg
--orca-surface
--orca-surface-soft
--orca-border
--orca-text
--orca-muted
--orca-primary
--orca-primary-soft
--orca-accent
--orca-warning
--orca-danger
--orca-radius-card
--orca-shadow-card
```

Não espalhar cores soltas sem necessidade.

---

## Regras obrigatórias

Não fazer:

- não criar módulos novos;
- não alterar a taxonomia V1;
- não mudar lógica de cálculo;
- não remover funcionalidades;
- não reescrever o app inteiro;
- não fazer refatoração estrutural grande;
- não quebrar arquitetura local-first;
- não mexer em arquivos grandes/sensíveis se puder resolver por CSS.

Fazer:

- trabalhar incrementalmente;
- preferir CSS, tokens e ajustes visuais pequenos;
- manter responsividade;
- manter legibilidade;
- manter build limpo;
- preservar navegação e fluxos atuais.

---

## Prioridades

1. Coerência visual global: fundo, cards, bordas, sombras, tipografia, botões e badges.
2. Tela Cálculos: grupos, cards, contadores, descrições e estados `LIVRE`, `PRO`, `EM BREVE`.
3. Telas de cálculo: overlays, campos, resultados, fórmulas, orientação e botões.
4. Fluxo comercial: levantamento, orçamento, relatório/proposta e itens salvos.
5. Mobile: garantir ótima leitura e toque confortável em telas pequenas.

---

## Responsividade

Validar para:

```txt
360px
390px
430px
768px
desktop comum
```

Garantir que:

- cards não estourem;
- botões não fiquem apertados;
- overlays rolem corretamente;
- grids virem uma coluna quando necessário;
- textos longos quebrem bem;
- ações principais continuem acessíveis.

---

## Arquivos prováveis

Revisar a cascata visual antes de alterar. Arquivos prováveis:

```txt
src/styles/global.css
src/styles/orcaosOfficialTheme.css
src/styles/orcaosApprovedConcept.css
src/styles/orcaosLayoutComposition.css
src/styles/orcaosVisualStabilization.css
src/styles/responsiveConsistency.css
src/styles/professionalPolish.css
src/styles/screenRefinement.css
src/styles/calculationRefinement.css
src/styles/calculationTaxonomyVisual.css
src/features/calculators/components/GeneralCalculatorWorkspace.css
src/features/calculators/components/ElectricalFundamentalsHumanWorkspace.css
```

Não é obrigatório mexer em todos. Evitar duplicação e conflito entre CSS existentes.

---

## Resultado esperado

O app deve ficar com aparência de produto publicável:

```txt
mais bonito
mais consistente
mais responsivo
mais profissional
mais confiável
mais agradável para screenshots da Play Store
```

Telas importantes para screenshots:

```txt
Dashboard
Cálculos
Fundamentos elétricos com fórmula
Orçamento técnico com markup/margem
Levantamento
Orçamento/proposta
Relatório
Perfil/configurações
```

---

## Testes obrigatórios

Depois das alterações, rode:

```bash
npm run typecheck
npm run build
```

Também validar manualmente:

- abrir dashboard;
- abrir Cálculos;
- abrir um módulo de cálculo;
- abrir campos avançados;
- verificar caixa de fórmula;
- adicionar ao levantamento/orçamento;
- abrir levantamento;
- abrir orçamento;
- verificar responsividade mobile.

---

## Entrega final

Ao final, informar:

```txt
1. Arquivos alterados
2. Melhorias visuais feitas
3. Paleta/tokens consolidados
4. Telas impactadas
5. Resultado do typecheck
6. Resultado do build
7. Pontos que ainda precisam revisão manual
```

Importante: esta é uma etapa de polimento visual global para o MVP. Não transformar em refatoração de plataforma.
