# AFERIX ERP PREMIUM: HOME ROUTING & CONNECTION AUDIT

> [!CAUTION]
> **AUDITORIA CRÍTICA DE CONEXÃO & COMPILAÇÃO VISUAL**
> **FONTE DA VERDADE (FIGMA):** `/docs/Design Home Aferix` (`App.tsx` de 37KB)
> **IMPLEMENTAÇÃO REAL (ROTAS):** `/src/app/screens/HomeScreen.tsx` (Conectado à rota `'pulse'`)
> **OBJETIVO:** Identificar por que a Home real parece "HTML cru" no navegador, mapear as divergências entre os componentes e definir o plano definitivo de convergência para que o app real renderize a qualidade visual absoluta do Figma.

---

## 1. O Diagnóstico de Conexão: Por que são duas Homes separadas?

Nossa análise confirmou o **Cenário 3** como o causador do descompasso estético. O ecossistema possui atualmente duas construções da Home que operam em silos paralelos:

```text
📂 docs/Design Home Aferix (A Casca do Figma)
   └── src/app/App.tsx ── [Standalone Preview em Vite local] ── (98/100 Visual Parity)

📂 src/app/screens/HomeScreen.tsx (O App Real)
   └── Conectado ao AppShell.tsx, useHomeAttentionStack.ts e IndexedDB ── (Visual Cru)
```

### O que causou a "Tela Crua" na rota real:
1.  **Falta de Compilação do CSS do Figma:** O protótipo do Figma (`App.tsx`) foi escrito utilizando **CSS-in-JS Inline** (`style={{ ... }}`) puro com sombras pesadas e famílias de fontes específicas.
2.  **Incompatibilidade de Fontes:** As fontes premium `'DM Mono'` (essencial para rótulos e números) e `'Inter'` estão configuradas por importação no standalone do Figma, mas não estão instaladas/compiladas no index HTML principal do OrcaOS, fazendo com que o navegador renderize a fonte serifada genérica (Times New Roman).
3.  **Vignette & AppShell Clashing:** O `AppShell.tsx` real envolve as telas em containers com paddings e bordas adicionais, e possui seu próprio dock inferior de 3 ações. Isso espreme e quebra o layout figma original que esperava um viewport de container livre.

---

## 2. Comparativo de Arquivos & Estrutura

| Característica | Figma Standalone (`docs/.../App.tsx`) | Home Real (`src/app/screens/HomeScreen.tsx`) |
| :--- | :--- | :--- |
| **Rota Ativa** | Nenhuma (Rodando em servidor isolado `/docs`) | Rota `'pulse'` dentro do `App.tsx` global |
| **Estilos** | CSS-in-JS inline ultra-fiel com HEX diretos | Tailwind utilitário mapeado para tokens leves |
| **Dados** | Mocks estáticos de alta fidelidade | Hooks offline-first com Dexie/IndexedDB |
| **Abas Inferiores** | 5 abas ativas flutuantes (Stripe/Wallet) | 3 botões rápidos de criação em rodapé fixo |
| **Efeitos** | Sombra dourada intensa, gradiente radial real | Sombra leve mapeada em tokens CSS variáveis |

---

## 3. Por que a Home aprovada não está aparecendo no app real?

A Home do Figma funciona perfeitamente quando rodamos o servidor do diretório `/docs/Design Home Aferix`, mas o compilador do aplicativo real no diretório raiz do OrcaOS lê apenas o arquivo `HomeScreen.tsx` sob a rota `'pulse'`.

Quando migramos os componentes, substituímos os estilos em linha por classes Tailwind mapeadas sob os novos tokens. No entanto:
1.  O arquivo index principal (`index.html`) e o reset CSS global (`global.css`) do OrcaOS não possuem as diretivas de fontes nem as classes de blur e translucidez otimizadas que o standalone usa.
2.  A folha de estilo `HomeScreen.css` do OrcaOS estava vazia e não carregava as regras de gradiente radial de fundo (`#050505`) e floor gold glow de forma explícita.

---

## 4. O Plano Definitivo de Convergência (Pixel-Perfect Bridge)

Para forçar o aplicativo real a renderizar a Home com a qualidade exata do Figma, executaremos as seguintes correções na próxima etapa:

### Passo A: Injeção de Fontes e Assets no Core
Adicionar as importações do Google Fonts para `'Inter'` e `'DM Mono'` diretamente no `<head>` do arquivo principal do aplicativo real:
*   [index.html](file:///home/remoto/OrcaOS/index.html)

### Passo B: Adaptação de Materiais do Figma em AferixComponents
Ajustar `SurfaceCard` e `BottomDock` em `/src/ui/system/AferixComponents.tsx` para usarem os exatos estilos inline do Figma caso o Tailwind falhe ou o navegador recuse a renderização do gradiente.

### Passo C: Acoplamento Fiel da Rota
Substituir a casca do `HomeScreen.tsx` para herdar exatamente a estrutura de blocos e dimensões do standalone do Figma, conectando a inteligência dos hooks diretamente às chaves corretas.
