# ARQUITETURA — AFERIX

Estrutura permitida:
- domain/
- hooks/
- services/
- repositories/
- storage/
- pages/

Regra:
React chama hooks/services.
Services chamam repositories.
Repositories acessam storage.
