# OrçaOS — Direção visual V1

Este documento registra a decisão visual vigente para o MVP do OrçaOS.

---

## 1. Princípio

O OrçaOS deve ter aparência profissional, limpa, responsiva e confiável, com pouca poluição visual.

A interface deve parecer uma ferramenta de trabalho de alto nível, não um painel cheio de elementos decorativos.

---

## 2. Direção atual para teste prático

Para o próximo teste do MVP, a interface deve operar em modo minimalista:

```txt
ícone principal/marca do OrçaOS: sim
ícones secundários de navegação: ocultos no teste
ícones dos módulos da taxonomia: ocultos no teste
ícones em cálculos internos: não usar
```

A hipótese do teste é que uma boa tipografia, bons agrupamentos, descrições claras, badges e hierarquia visual podem ser suficientes para a primeira publicação.

---

## 3. Uso de ícones

### Permitido no MVP

- marca/ícone principal do OrçaOS;
- favicon/app icon;
- splash/iconografia institucional;
- ícones secundários somente se o teste prático mostrar que fazem falta.

### Evitar no MVP

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

## 5. Biblioteca base

A biblioteca base atual é:

```txt
lucide-react
```

Ela permanece no projeto por enquanto porque a estrutura já existe e a decisão final ainda será tomada após o teste prático.

Se o teste confirmar que o MVP ficará sem ícones secundários, a próxima limpeza poderá remover:

```txt
lucide-react
src/components/ui/AppIcon.tsx
src/styles/appIcon.css
src/features/calculators/config/moduleIconMap.ts
src/features/calculators/types/iconKeys.ts
```

Essa remoção só deve acontecer depois de confirmar que nenhum componente depende mais desses arquivos.

---

## 6. Tipografia

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

## 7. Sequência de produção visual antes da primeira publicação

### Fase A — Teste minimalista

1. Ocultar ícones secundários do menu lateral.
2. Ocultar ícones dos cards da tela Cálculos.
3. Manter apenas marca/ícone principal do app.
4. Testar leitura no celular.
5. Verificar se navegação continua clara sem ícones.
6. Verificar se a tela Cálculos continua fácil de entender.

### Fase B — Decisão visual

Após teste prático, escolher um caminho:

```txt
Caminho 1: MVP sem ícones secundários
Caminho 2: MVP com poucos ícones estratégicos
```

### Fase C — Organização final

Se escolher o caminho 1:

- remover dependência de ícones;
- apagar mapas/componentes não usados;
- manter apenas app icon/brand icon;
- revisar screenshots da Play Store sem ícones secundários.

Se escolher o caminho 2:

- manter apenas poucos ícones estratégicos;
- criar/importar ícones próprios do Canva;
- não reintroduzir ícones em cálculos internos;
- mapear ícones apenas em módulos principais.

---

## 8. Diretriz para próximas mudanças

Fazer:

- melhorar tipografia;
- melhorar espaçamento;
- fortalecer hierarquia visual;
- usar ícones somente se ajudarem a navegação;
- manter componentes consolidados.

Evitar:

- ícones em todos os cards internos;
- emoji como ícone definitivo;
- mapas de ícones por cálculo interno;
- novos arquivos paralelos para resolver visual que deveria estar consolidado.

---

## 9. Resumo

```txt
MVP em teste: quase sem ícones secundários
Ícone principal do app: mantido
Tipografia: protagonista
Visual: profissional, escuro, técnico e elegante
Manutenção: consolidada e sem poluição visual
```
