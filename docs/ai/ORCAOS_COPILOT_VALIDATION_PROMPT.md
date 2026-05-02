# OrçaOS — Prompt para validação com GitHub Copilot

Use este arquivo como instrução direta para o Copilot validar o estado atual do OrçaOS antes de avançarmos para as próximas fases do MVP Play Store.

---

## Prompt para o Copilot

Vamos validar o OrçaOS para seguir para as próximas fases do MVP Play Store.

Repositório: `mateusrossi-jpg/OrcaOS`

### Contexto

Estamos consolidando o OrçaOS como app modular local-first para publicação futura na Play Store. A fase atual foi focada em revisar cálculos existentes e melhorar UX humana em campo, sem expandir módulos novos.

### Implementações recentes

Foram criados ou alterados arquivos relacionados a:

- `src/features/calculators/components/ElectricalFundamentalsHumanWorkspace.tsx`
- `src/features/calculators/components/ConvertersHumanWorkspace.tsx`
- `src/features/calculators/components/PaintingHumanWorkspace.tsx`
- `src/features/calculators/components/ConstructionHumanWorkspace.tsx`
- `src/features/calculators/components/TechnicalBudgetHumanWorkspace.tsx`
- `src/features/calculators/components/UnifiedHydraulicsWorkspace.tsx`
- `src/features/calculators/components/GeneralCalculatorWorkspace.ts`
- `src/features/calculators/components/CalculationTaxonomyOverview.tsx`
- `src/features/calculators/components/CalculationTaxonomyOverview.css`
- `src/main.tsx`

### Taxonomia aprovada

A taxonomia final V1 dos cálculos deve ser preservada:

```txt
Cálculos
├── Essenciais
├── Profissões
├── Especialidades
├── Orçamento e gestão
└── Conversores técnicos
```

Dentro de **Profissões**:

```txt
├── Elétrica e instalações
├── Redes, segurança e automação residencial
├── Hidráulica
├── Construção civil
├── Pintura e acabamento
└── Refrigeração e climatização
```

Dentro de **Especialidades**:

```txt
├── Automação industrial e instrumentação
├── Eletrônica aplicada
├── Motores, comandos e rebobinagem
├── Transformadores
└── Solar fotovoltaico
```

### Critério de UX dos cálculos

Todo cálculo precisa ser pensado para uso humano real no celular, em campo:

- poucos campos obrigatórios;
- campos avançados escondidos;
- resultado direto;
- orientação prática;
- unidade clara;
- nada de pedir campos equivalentes desnecessários;
- se houver muitos campos, dividir em etapas.

---

## Tarefa principal

Faça uma validação técnica completa antes de avançarmos para próximas fases.

### 1. Rodar validação local

Execute:

```bash
npm install
npm run typecheck
npm run build
```

### 2. Corrigir apenas erros reais

Corrija apenas erros reais de:

- build;
- typecheck;
- import;
- TypeScript;
- CSS inexistente/import quebrado;
- componente que não compila.

Não fazer refatoração grande agora.

### 3. Verificar pontos críticos

Verifique especialmente:

- se `GeneralCalculatorWorkspace.ts` compila corretamente usando `createElement`;
- se os módulos `obras` e `orcamentoTecnico` roteiam corretamente para as novas telas humanas;
- se `pintura`, `hidraulica`, `conversores` e `fundamentos` continuam abrindo;
- se não há import quebrado;
- se não há erro por CSS inexistente;
- se `CalculationTaxonomyOverview.tsx` não causa erro mesmo ainda não sendo a tela principal conectada diretamente;
- se `global.css` e `orcaosMvpTheme.css` preservam layout mobile;
- se os campos avançados aparecem/escondem corretamente;
- se os botões `Adicionar ao levantamento`, `Adicionar ao orçamento` e `Adicionar aos dois` continuam funcionando;
- se a tela Cálculos ainda permite abrir todos os módulos disponíveis;
- se os módulos em breve não quebram navegação.

### 4. Restrições importantes

Não fazer agora:

- não criar módulos novos;
- não expandir funcionalidades;
- não reescrever o app inteiro;
- não alterar arquitetura principal sem necessidade;
- não mexer em `AppOrcaNextOrganized.tsx` se não for obrigatório para corrigir build;
- não trocar a taxonomia V1 aprovada;
- não remover telas novas humanas já criadas.

Trabalhar em commits pequenos e priorizar:

- build limpo;
- estabilidade;
- UX simples;
- app publicável;
- sem bagunçar arquitetura.

---

## Resultado esperado da validação

Após validar e corrigir, gerar um resumo com:

```txt
1. Erros encontrados
2. Arquivos corrigidos
3. Resultado do npm run typecheck
4. Resultado do npm run build
5. Riscos técnicos ainda existentes antes da Play Store
6. Se já podemos avançar para a próxima fase
```

---

## Próxima fase pretendida após validação

Se `typecheck` e `build` passarem, avançar para:

- polimento visual final da tela Cálculos;
- ajuste de nomes, descrições e contadores;
- revisão do fluxo Levantamento → Orçamento → Relatório/PDF;
- validação de backup local;
- preparação gradual para MVP publicável na Play Store.
