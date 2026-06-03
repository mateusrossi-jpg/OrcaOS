# AFERIX ROLE VALIDATION REPORT

## 1. Matriz de Validação de Shells

| Perfil | Shell Carregado | Itens do Dock (Tabs) | Visibilidade EQUIPE | Visibilidade PROPOSTAS | Status |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **OWNER** | `OwnerShell` | Empresa, Financeiro, Clientes, Equipe, Menu | ✅ SIM | ❌ NÃO (em Pulse) | ✅ VALIDADO |
| **MANAGER** | `ManagerShell` | Mapa, Dispatch, Agenda, Equipe, Menu | ✅ SIM | ❌ NÃO | ✅ VALIDADO |
| **SALES** | `SalesShell` | Pipeline, Anomalias, Propostas, Clientes, Menu| ❌ NÃO | ✅ SIM | ✅ VALIDADO |
| **FIELD** | `FieldShell` | Execução, Ativos, Laudos, Menu | ❌ NÃO | ❌ NÃO | ✅ VALIDADO |
| **SOLO** | `SoloShell` | Empresa, Propostas, Agenda/OS, Financeiro, Menu| ❌ NÃO | ✅ SIM | ✅ VALIDADO |
| **CUSTOMER** | `CustomerShell` | Home, Laudos, Propostas, Menu | ❌ NÃO | ✅ SIM | ✅ VALIDADO |

## 2. Validação Específica: Perfil SOLO

Após a restauração da infraestrutura de RBAC, o perfil SOLO foi validado com as seguintes configurações:

1.  **Shell:** `SoloShell` (Confirmado via log e diagnóstico dev).
2.  **Dock Operacional:**
    -   `EMPRESA` (Home)
    -   `PROPOSTAS` (Aba Budgets ativa)
    -   `AGENDA / OS` (Aba Agenda ativa)
    -   `FINANCEIRO` (Aba Money ativa)
    -   `MENU` (Aba Settings ativa)
3.  **Diferencial Crítico:** A aba `EQUIPE` foi removida, dando lugar à aba `PROPOSTAS` diretamente no dock principal.

## 3. Permissões Efetivas (Solo)
O perfil SOLO agora possui acesso unificado a:
-   `REVENUE_INBOX` (Anomalias)
-   `PROPOSALS` (Criação de orçamentos)
-   `AGENDA` (Execução técnica)
-   `MRR` (Radar de faturamento recorrente)

## 4. Erros Encontrados & Corrigidos
-   **Erro:** `setRole` não persistia a alteração. **Correção:** Implementado `AuthService.impersonateRole` com despacho de eventos globais.
-   **Erro:** `SOLO` ausente no DebugPanel. **Correção:** Adicionado `'SOLO'` à lista de botões de simulação.
-   **Erro:** Ambiguidade de Shell. **Correção:** Adicionado indicador visual `Aferix Dev Diagnostic` para prova de runtime.

## 5. Veredito Final
A infraestrutura de RBAC está **RESTAURADA**. O modo SOLO é agora totalmente testável e funcional, respeitando a constituição de produtividade individual.
