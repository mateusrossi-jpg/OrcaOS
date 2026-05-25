# AFERIX — REGRAS GLOBAIS

Aferix é um ERP financeiro mobile-first para autônomos e prestadores.

## Regra principal
Tudo gira em torno do orçamento.

## MVP
Foco em:
- orçamento
- custos
- lucro
- margem
- clientes
- histórico
- financeiro simples

## Arquitetura
React NÃO toca no banco.

Fluxo:
React -> Hooks -> Services -> Repositories -> Storage

## UI
- Dark premium
- Amarelo/dourado como accent principal
- Mobile-first
- Cards escuros
- Sem teal/cyan como cor principal

## Proibido
- overengineering
- dashboard complexo
- CQRS
- event bus
- DI complexa
- state machine gigante
- refatoração sem necessidade
