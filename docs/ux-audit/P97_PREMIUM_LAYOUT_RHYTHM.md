# P97 — Premium Layout Rhythm

## 1. Screenshots Capturados
As capturas de tela foram geradas usando o framework Playwright simulando a viewport do iPhone 13 e encontram-se no diretório `docs/ux-audit/screenshots/p97/`.
- `01-home.png`
- `02-historico.png`
- `03-financeiro.png`
- `04-mais.png`
- `05-clientes.png`
- `06-catalogo.png`
- `07-relatorios.png`
- `08-licenca-pro.png`
- `09-novo-orcamento.png`

## 2. Problemas Visuais Encontrados (Audit)
- **Telas com excesso de altura:** O `Home` e o `Histórico` estão com cards longos (ex: botões CTA e ListCards muito largos, exigindo rolagem em telas pequenas).
- **Cards com padding excessivo:** O uso desenfreado de padding nos list items e modais de context faz parecer um "web app empilhado".
- **Elementos desalinhados:** No Histórico e Home, o KPI de lucro tem margens estranhas, e o "status badge" não alinha organicamente.
- **Status/badge soltos:** Badges como "Finalizado" ou "Em andamento" aparecem flutuando ou quebrando o layout em viewport pequena.
- **Valores competindo com ações:** Na listagem (`ERP Row`), os valores dos orçamentos competem com o menu de contexto `...` ocupando o mesmo espaço horizontal.
- **Bottom Nav pesada:** A barra inferior consome muita `safe-area` e possui botões ativos visualmente pesados.
- **Listas parecendo web cards:** Em `Histórico` e `Home`, a listagem não tem ritmo de tabela operacional (linha ERP).

## 3. Recomendações e Correções (A Serem Aplicadas)
- **Ritmo Visual (CSS Tokens):** Criação de tokens formais como `--aferix-page-padding-mobile`, `--aferix-row-height`, etc.
- **Transformação de Listas em ERP Rows:** Modificar `.continuous-list-item`, `.status-compact-item`, etc., para adotar um estilo mais fino (Grid: Esquerda com Cliente/Data, Direita com Valor/Menu, Badge em linha secundária).
- **Bottom Nav:** Redução de padding, diminuição do highlight no botão ativo.
- **Menu "Mais" e Licença:** Limpeza de termos internos (feito), simplificação do UI no Pro.

## 4. Problemas Adiados
- Animações complexas de transição entre abas (não foca em layout rhythm fixo).
- Ajustes de dark mode dinâmico para tabelas complexas de relatórios.

## 5. Decisão Final
Aguardando aplicação do novo sistema de variáveis CSS e validação.
