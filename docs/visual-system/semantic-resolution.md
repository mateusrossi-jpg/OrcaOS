# AFERIX SEMANTIC RESOLUTION
**Status: MANDATORY | Focus: LOGICAL INFERENCE**

## 1. THE INFERENCE PIPELINE
O runtime resolve a visualização seguindo este pipeline de prioridade:
1. **Screen Type:** O tipo base da tela (Input).
2. **Density Mapping:** Define a escala de espaçamento base.
3. **Hierarchy Determination:** Define o peso tipográfico e alinhamento.
4. **Atmospheric Projection:** Injeta variáveis de blur, glow e profundidade.
5. **Motion Profiling:** Define a curva de aceleração e duração das transições.

## 2. HOW TO USE THE RUNTIME
O desenvolvedor não deve mais usar layouts fixos. O uso correto é através do componente `<SemanticScreen />`.

### CORRECT PATTERN:
```tsx
<SemanticScreen type="finance">
  <FinancialLedger />
</SemanticScreen>
```

### INCORRECT PATTERN:
```tsx
<AppScreen className="p-4 gap-2"> // MANUAL HACK - PROHIBITED
  <FinanceTitle />
  <FinanceList />
</AppScreen>
```

## 3. RUNTIME VARIABLES (CSS)
O `SemanticScreen` injeta as seguintes variáveis no escopo da tela, que são consumidas pelas Primitives:
- `--runtime-section-spacing`: Controla a distância rítmica entre blocos.
- `--runtime-blur-intensity`: Controla a força do backdrop-filter.
- `--runtime-radius-surface`: Controla a suavidade dos cantos dos cards.
- `--runtime-motion-duration`: Controla a velocidade de resposta do sistema.

## 4. RESOLUTION EXCEPTIONS
Caso uma tela precise de um comportamento híbrido (ex: Financeiro com Hero Cinematic), utilize a prop `cinematic={true}` no `SemanticScreen` para elevar a intensidade atmosférica sem quebrar a densidade técnica.
