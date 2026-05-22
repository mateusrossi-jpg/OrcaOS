# Integration Layer — Aferix

Esta camada é responsável por traduzir as entidades operacionais do Aferix (Orçamentos, Clientes, Financeiro) para formatos compatíveis com sistemas externos.

## Responsabilidades
- **Adaptação de Dados:** Converter modelos internos para contratos de APIs de terceiros.
- **Mapeamento Fiscal:** Traduzir itens de orçamento para NCM/CFOP conforme o `TaxProfile`.
- **Exportação:** Gerar payloads para exportação XML/Excel.

## Regras de Design
1. **Isolamento:** Nenhum componente de UI deve depender diretamente desta camada.
2. **Independência:** A camada operacional (Base/Work) não deve saber da existência de integrações específicas.
3. **Segurança:** Credenciais de integração (API Keys) devem ser gerenciadas via `Security Layer` e nunca expostas em logs ou na UI.
