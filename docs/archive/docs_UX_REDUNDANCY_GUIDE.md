# Aferix — Guia de Redução de Redundância UX

## Princípio

Menu navega, botão executa ação.

## Regras

- Navegação fica em menu, tabs ou toolbar.
- Criação fica em botão contextual.
- Empty state só mostra CTA quando não há outro CTA principal visível.
- Uma ação principal não deve aparecer duas vezes no mesmo contexto visual.
- Ações de salvar, importar, exportar, copiar, verificar ou imprimir ficam dentro da seção onde o resultado aparece.
- Suspeitas de redundância com risco médio ou alto devem ser documentadas antes de qualquer remoção.

## Exemplos aplicados

- Novo cliente fica dentro de Clientes.
- Novo atendimento fica no contexto de atendimento.
- Novo item fica dentro de Catálogo > Itens.
- Novo lançamento fica dentro de Financeiro.
- Adicionar ao orçamento fica no detalhe do cálculo.
- Imprimir/PDF fica na prévia do relatório.
- Compra de plano fica no card do plano; verificação fica na seção de status.

## Auditoria desta rodada

- Dashboard: sem correção aplicada. Mantidos atalhos de visão geral para Orçamento rápido, Precificar e Financeiro. Risco de remoção: médio, porque são entradas globais úteis.
- Propostas: sem correção aplicada. O fluxo Projeto, Escopo, Custos, Comercial e Proposta está preservado. Catálogo e Histórico internos foram mantidos por segurança. Risco de remoção: médio.
- Clientes e Atendimentos: validado. Toolbar permanece somente Painel, Clientes e Histórico. Risco de regressão coberto pelo visual QA.
- Financeiro: redundância de baixo risco já corrigida. O card intermediário de Gestão Financeira foi removido e Novo lançamento ficou no Histórico.
- Catálogo: suspeita documentada. A toolbar interna de Itens ainda diferencia Lista e Novo Item; foi mantida por segurança para não tocar na padronização visual recente. Risco de remoção: médio.
- Simulador: validado. As ações Adicionar ao atendimento, Adicionar ao orçamento, Adicionar aos dois e Voltar continuam no detalhe do cálculo.
- Compras: sem correção aplicada. A tela está diferenciada como lista de compra do cliente, com Copiar lista no header.
- Relatórios: sem correção aplicada. Imprimir/PDF aparece na prévia do documento.
- Base técnica: sem correção aplicada. As ações estão ligadas ao fluxo técnico atual e devem ser revisadas em rodada própria.
- Licença: redundância de baixo risco corrigida. O CTA Assinar Pro fora do card foi removido e o plano Vitalício desabilitado passou a comunicar Planejado.
- Configurações: sem correção aplicada. Tabs permanecem como navegação e ações ficam dentro de cada seção.

## Redundâncias corrigidas nesta rodada

- `src/app/screens/StoreScreen.tsx`: removido o CTA secundário `Assinar Pro` da seção de assinatura/status, preservando `Verificar`.
- `src/app/screens/StoreScreen.tsx`: alterado o botão desabilitado do plano Vitalício de `Quero este plano` para `Planejado`, evitando competição com o CTA Pro.
- `src/features/finance/components/SimpleFinanceWorkspace.tsx`: removido o card intermediário de Gestão Financeira que apenas repetia `Novo lançamento`.
- `src/features/finance/components/SimpleFinanceWorkspace.tsx`: mantido `Novo lançamento` como ação contextual do Histórico financeiro.
- `scripts/visual-qa.mjs`: adicionados guardrails leves para fluxo de Propostas, Clientes/Atendimentos, Simulador, Catálogo e presença deste guia.

## Pontos mantidos por segurança

- Dashboard: atalhos globais mantidos por serem entradas de uso rápido, não duplicações próximas de seção.
- Propostas: `Catálogo` e `Histórico` internos mantidos porque suportam edição e retomada de orçamento no workspace atual.
- Propostas: empty state com `Adicionar itens` mantido na prévia sem itens, pois é CTA único para voltar ao Escopo.
- Catálogo: navegação interna `Lista` e `Novo Item` mantida para não desfazer a padronização visual recente.
- Licença: seção Google Play mantida porque é canal condicional de compra/restauração e não compete no fluxo padrão quando indisponível.
- Configurações: cards de prontidão mantidos porque resumem estado e não executam ações duplicadas.
