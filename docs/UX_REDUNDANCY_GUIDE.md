# Aferix — Guia de redundância de UX

## Princípio

Menu navega, botão executa ação.

Menus, tabs e steppers devem levar o usuário para uma área do produto. Botões devem executar uma ação contextual, como criar, salvar, exportar, copiar, verificar ou iniciar um fluxo.

## Onde ficam as ações principais

- Dashboard: visão geral e atalhos úteis para fluxos centrais, sem repetir ações que já pertencem a uma tela específica.
- Clientes e Atendimentos: a navegação fica em Painel, Clientes e Histórico. Novo atendimento fica no banner de contexto quando não há atendimento ativo. Novo cliente fica dentro da seção Clientes.
- Propostas: o fluxo principal fica no stepper Projeto, Escopo, Custos, Comercial e Proposta. Ações de etapa ficam dentro da própria etapa.
- Financeiro: Novo lançamento fica no Histórico financeiro, junto dos lançamentos existentes.
- Compras: Copiar lista fica no header da lista de compra do cliente. Edição de item fica dentro do item.
- Relatórios: Imprimir/PDF fica no card de prévia do documento.
- Licença: contratação fica no card do plano. Verificação de status fica na seção de assinatura.
- Configurações: cada ajuste fica dentro da seção correspondente, como perfil, segurança, backup, preferências ou sobre.

## Exemplos aplicados

- Remover `+ Cliente` e `+ Atendimento` da toolbar de Clientes e Atendimentos, preservando somente a navegação.
- Mover `Novo cliente` para dentro da seção Clientes.
- Manter `Novo atendimento` no contexto correto, sem competir com a toolbar.
- Mover `Novo lançamento` para o header do Histórico financeiro e remover o card intermediário que só repetia a ação.
- Remover `Assinar Pro` da seção de assinatura, porque `Quero este plano` já é o CTA de compra no card Pro.

## Redundâncias corrigidas nesta rodada

- Financeiro: removido card isolado de Gestão Financeira que existia apenas para hospedar `Novo lançamento`.
- Financeiro: `Novo lançamento` ficou como ação contextual no Histórico.
- Licença: removido segundo CTA de assinatura na seção de status, mantendo compra no PlanCard.
- Visual QA: adicionadas validações leves para proteger o padrão contra regressões óbvias.

## Pontos para revisão futura

- Propostas ainda tem áreas auxiliares de Catálogo e Histórico dentro do workspace. Elas foram mantidas por segurança porque fazem parte do fluxo atual de orçamento.
- Dashboard mantém atalhos para Orçamento rápido, Precificar e Financeiro por serem entradas úteis de visão geral, não duplicações próximas.
- Catálogo tem navegação interna própria. Não foi alterado nesta rodada para preservar o visual já padronizado.
- Configurações mantém cards de prontidão no topo porque resumem estado do produto e não executam ações.
