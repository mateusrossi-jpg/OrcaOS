# Aferix — Direção visual V1

Este documento registra a decisão visual vigente para o MVP do Aferix.

---

## 1. Princípio

O Aferix deve ter aparência profissional, limpa, responsiva e confiável, com pouca poluição visual.

A interface deve parecer uma ferramenta de trabalho de alto nível, apoiada em tipografia, hierarquia, espaçamento e clareza, não em excesso de elementos decorativos.

---

## 2. Decisão vigente para o MVP

A primeira publicação do MVP deve seguir uma direção tipográfica e minimalista:

```txt
ícone principal/marca do Aferix: sim
favicon/app icon: sim
splash/iconografia institucional: sim
ícones secundários de navegação: não
ícones dos módulos da taxonomia: não
ícones em cálculos internos: não
```

A hipótese final para o MVP é que uma boa tipografia, bons agrupamentos, descrições claras, badges e hierarquia visual são suficientes para a primeira publicação.

---

## 3. Uso de ícones

### Permitido no MVP

- marca/ícone principal do Aferix;
- favicon/app icon;
- splash/iconografia institucional.

### Não usar no MVP

- ícones em todos os itens do menu;
- ícones em todos os módulos da tela Cálculos;
- ícones em cada cálculo interno;
- emojis como ícone definitivo;
- bibliotecas de ícones espalhadas diretamente em telas.

---

## 4. Justificativa

Reduzir ícones melhora:

- clareza;
- elegância;
- manutenção;
- velocidade de evolução;
- consistência visual;
- sensação de produto maduro;
- foco em conteúdo real.

Ícones demais deixam o app visualmente carregado e podem criar retrabalho quando a taxonomia crescer.

---

## 5. Limpeza técnica aplicada

A estrutura de ícones secundários foi removida do MVP tipográfico.

Removidos/dispensados:

```txt
lucide-react
src/components/ui/AppIcon.tsx
src/styles/appIcon.css
src/features/calculators/config/moduleIconMap.ts
src/features/calculators/types/iconKeys.ts
```

Se no futuro o Aferix voltar a usar ícones secundários, a implementação deve ser feita em uma fase própria, com pack autoral ou biblioteca definida, sem reintroduzir ícones nos cálculos internos.

---

## 6. Tipografia

A tipografia oficial do MVP usa stack segura, sem carregar fonte externa agora:

```txt
Títulos: Manrope, Inter, system-ui
Texto/campos: Inter, Manrope, system-ui
Mono: SFMono/Consolas/Menlo

### Escala Tipográfica Controlada (Clareza > Tamanho)
- Métricas principais: máximo `text-3xl` ou `text-4xl` (evitar tamanhos colossais que quebram o layout mobile).
- Labels/Badges: `text-xs` ou `text-sm` em uppercase com tracking leve (`tracking-wide`).
- Corpo de texto: `text-base` com entrelinha adequada (`leading-relaxed`) para máxima legibilidade.
```

Arquivo central:

```txt
src/styles/orcaosTypography.css
```

Essa decisão evita peso extra de carregamento e mantém boa aparência se a fonte estiver disponível no sistema.

---

## 7. Sequência de produção visual antes da primeira publicação

### Fase A — MVP tipográfico

1. Remover ícones secundários da interface.
2. Manter apenas ícone/marca principal do Aferix.
3. Fortalecer tipografia, títulos e subtítulos.
4. Melhorar espaçamentos e agrupamentos.
5. Manter badges claros como LIVRE, PRO e EM BREVE.
6. Testar leitura no celular.
7. Validar screenshots para Play Store.

### Fase B — Teste prático

Validar se:

- o menu continua claro sem ícones;
- a tela Cálculos continua fácil de entender;
- os grupos da taxonomia estão bem separados;
- os módulos são identificáveis por texto;
- o visual parece profissional e não pobre.

### Fase C — Decisão pós-MVP

Após a primeira publicação ou teste real, escolher:

```txt
Caminho 1: manter Aferix tipográfico e sem ícones secundários
Caminho 2: adicionar poucos ícones estratégicos com pack próprio
```

Se escolher o caminho 2:

- criar/importar ícones próprios;
- usar apenas em navegação e módulos principais;
- não reintroduzir ícones em cálculos internos;
- aplicar gradualmente em uma versão futura.

---

## 8. Diretriz para próximas mudanças

Fazer:

- melhorar tipografia;
- melhorar espaçamento;
- fortalecer hierarquia visual;
- usar texto claro e bem organizado;
- manter componentes consolidados.

Evitar:

- ícones em todos os cards internos;
- emoji como ícone definitivo;
- mapas de ícones por cálculo interno;
- novos arquivos paralelos para resolver visual que deveria estar consolidado.

---

## 9. Resumo

```txt
MVP: tipográfico e minimalista
Ícone principal do app: mantido
Ícones secundários: removidos
Tipografia: protagonista
Visual: profissional, escuro, técnico e elegante
Manutenção: consolidada e sem poluição visual
```
