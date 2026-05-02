# Template de tarefa para Copilot no OrçaOS

Use este texto como base ao pedir uma mudança no GitHub/Codespaces.

## Antes de editar

Leia os documentos:

- `.github/copilot-instructions.md`
- `docs/ai/ORCAOS_PROJECT_CONTEXT.md`
- `docs/ai/ORCAOS_ARCHITECTURE_GUIDE.md`
- `docs/ai/ORCAOS_IMPLEMENTATION_BACKLOG.md`
- `docs/ai/ORCAOS_TESTING_CHECKLIST.md`

## Regras do projeto

- O nome visível do produto é **OrçaOS**.
- Textos do app devem ficar em português do Brasil.
- O app deve continuar compilando.
- Prefira mudanças pequenas e testáveis.
- Não quebre o fluxo cálculo → levantamento → orçamento → relatório.
- Não adicione dependências sem necessidade clara.
- Preserve a experiência mobile.

## Arquivos importantes

- `src/main.tsx`
- `src/app/AppOrcaNextOrganized.tsx`
- `src/core/types/workflow.ts`
- `src/core/access/featureAccess.ts`
- `src/features/workflow/components/GuidedBudgetCartPro.tsx`
- `src/features/calculators/components/StableGeneralCalculatorWorkspace.tsx`
- `src/features/calculators/components/UnifiedHydraulicsWorkspace.tsx`
- `src/data/parts/catalogParts.ts`

## Modelo de pedido

Implementar a seguinte melhoria no OrçaOS:

> [descreva a tarefa aqui]

Critérios:

1. manter TypeScript limpo;
2. manter textos em pt-BR;
3. preservar fluxo para levantamento/orçamento/relatório;
4. testar visualmente em tela mobile;
5. listar arquivos alterados e caminho de teste.

## Boas próximas tarefas

- adicionar kit automático de tomada simples 4x2;
- adicionar kit automático de interruptor simples;
- adicionar kit automático de ponto de iluminação;
- adicionar subtotal por ambiente no orçamento guiado;
- permitir duplicar/remover item de kit;
- ampliar catálogo interno com peças elétricas comuns;
- melhorar layout mobile do orçamento guiado;
- ajustar relatório/PDF contra estouro de texto.
