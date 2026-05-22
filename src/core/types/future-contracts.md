# Contratos de Preparação Futura — Aferix

Este diretório contém definições técnicas reservadas para a evolução do ecossistema Aferix.

## Objetivo
Estabelecer contratos de dados (TypeScript Interfaces/Types) que permitam a expansão do sistema para:
- Atendimento MEI/Microempresa (Fiscal)
- Sincronização Multi-dispositivo (Sync)
- Integração com Fornecedores (Base)
- Gestão de Equipe (Roles)

## Regras de Uso
1. **Isolamento Total:** Estes tipos não devem ser utilizados na UI operacional atual.
2. **Invisibilidade:** Nenhuma funcionalidade baseada nestes contratos deve ser exposta ao usuário final nesta fase.
3. **Estabilidade:** Mudanças nestes contratos devem ser incrementais e retrocompatíveis.

## Estrutura
- `future-contracts.ts`: Definições TypeScript puras.
