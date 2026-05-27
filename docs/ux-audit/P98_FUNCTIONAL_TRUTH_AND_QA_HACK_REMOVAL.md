# P98 — FUNCTIONAL TRUTH & QA HACK REMOVAL

## 1. QA Hacks Removidos

- **StoreScreen.tsx**: Removida a tag `<details style={{ display: 'none' }}>` contendo o `span` com `className="android-package"`. Esse bloco era um hack visual invisível ao usuário inserido exclusivamente para enganar o script de teste `visual:qa`.
- **visual-qa.mjs**: Removida a verificação artificial que obrigava a tela `StoreScreen.tsx` a ter a classe `android-package` e a tag `details`.

## 2. Auditoria de Verdade Funcional

| Tela | Elemento | Status | Problema | Decisão MVP |
|---|---|---|---|---|
| **Home** | Botão "Novo orçamento" | Real | Nenhum | Manter |
| **Home** | Botão "Continuar trabalho" | Real | Nenhum | Manter |
| **Home** | Lista de Últimos Orçamentos | Real | Nenhum | Manter |
| **Novo Orçamento** | Botões de etapas (Avançar/Salvar) | Real | Nenhum | Manter |
| **Histórico** | Filtros e seleção de orçamento | Real | Nenhum | Manter |
| **Financeiro** | Cards de resumo (Mês/Lucro) | Real | Nenhum | Manter |
| **Clientes** | Adicionar Cliente / Atendimento | Real | Nenhum | Manter |
| **Catálogo** | Adicionar Item / Editar | Real | Nenhum | Manter |
| **Relatórios** | Gerar PDF / Imprimir | Real | Nenhum | Manter |
| **Mais (Menu)** | Links de navegação (Clientes, etc) | Real | Nenhum | Manter |
| **Backup** | Opções Local e Google Drive | Real | Nenhum | Manter |
| **Segurança** | Bloqueio por PIN | Real | Nenhum | Manter |
| **Licença Pro** | Botão "Sua licença atual" (FREE) | Real (Desativado) | Nenhum | Manter |
| **Licença Pro** | Botão "Quero este plano" (PRO) | Real | Nenhum | Manter |
| **Licença Pro** | Botão "Futuramente" (Vitalício) | Real (Desativado) | Nenhum | Manter |
| **Perfil (Configurações)** | Vincular Google / Email | Real | Nenhum | Manter |
| **Perfil (Configurações)** | Entrar Local / Sair | Real | Nenhum | Manter |

## 3. Resumo e Status Final

- **Hacks encontrados:** 1 (Metadado invisível em `StoreScreen.tsx`).
- **Hacks removidos:** 1 removido do componente e do validador.
- **Testes corrigidos:** `visual:qa` ajustado para não exigir o hack no StoreScreen.
- **Funções fake removidas:** Elemento invisível que passava teste falsamente.
- **Validações Reais:** Todas as telas e fluxos mantêm a integridade baseadas na sua real função de negócio.
- **Status da entrega:** MVP SEM GAMBIARRA E FUNCIONALMENTE HONESTO.
