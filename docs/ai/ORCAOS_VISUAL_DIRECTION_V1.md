# OrçaOS — Direção visual V1

Este documento registra a decisão visual vigente para o MVP do OrçaOS.

---

## 1. Princípio

O OrçaOS deve ter aparência profissional, limpa, responsiva e confiável, com pouca poluição visual.

A interface deve parecer uma ferramenta de trabalho de alto nível, não um painel cheio de elementos decorativos.

---

## 2. Uso de ícones

Ícones devem ser usados apenas em pontos estratégicos da árvore visual:

- navegação principal;
- grupos principais;
- módulos da taxonomia;
- áreas importantes como Cálculos, Levantamento, Orçamento, Relatórios, Clientes/OS e Configurações;
- badges ou estados muito relevantes, quando necessário.

Não usar ícones em todos os cálculos internos.

Exemplo: dentro de Fundamentos elétricos, cálculos como Lei de Ohm, Corrente, Potência e Consumo podem ser apresentados com boa tipografia, cards, hierarquia e badges, sem necessidade de ícone individual em cada item.

---

## 3. Justificativa

Reduzir ícones internos melhora:

- clareza;
- elegância;
- manutenção;
- velocidade de evolução;
- consistência visual;
- sensação de produto maduro.

Ícones demais deixam o app visualmente carregado e podem criar retrabalho quando a taxonomia crescer.

---

## 4. Biblioteca base

A biblioteca base atual é:

```txt
lucide-react
```

Ela deve ser usada através do componente central:

```txt
src/components/ui/AppIcon.tsx
```

E dos mapas estratégicos:

```txt
src/features/calculators/config/moduleIconMap.ts
```

Não espalhar imports diretos de ícones em telas sem necessidade.

---

## 5. Tipografia

A tipografia oficial do MVP usa stack segura, sem carregar fonte externa agora:

```txt
Títulos: Manrope, Inter, system-ui
Texto/campos: Inter, Manrope, system-ui
Mono: SFMono/Consolas/Menlo
```

Arquivo central:

```txt
src/styles/orcaosTypography.css
```

Essa decisão evita peso extra de carregamento e mantém boa aparência se a fonte estiver disponível no sistema.

---

## 6. Diretriz para próximas mudanças

Fazer:

- melhorar tipografia;
- melhorar espaçamento;
- fortalecer hierarquia visual;
- usar poucos ícones bem escolhidos;
- manter componentes consolidados.

Evitar:

- ícones em todos os cards internos;
- emoji como ícone definitivo;
- mapas de ícones por cálculo interno;
- novos arquivos paralelos para resolver visual que deveria estar consolidado.

---

## 7. Resumo

```txt
Ícones: poucos e estratégicos
Tipografia: forte e limpa
Visual: profissional, escuro, técnico e elegante
Manutenção: consolidada, sem ícones espalhados
```
