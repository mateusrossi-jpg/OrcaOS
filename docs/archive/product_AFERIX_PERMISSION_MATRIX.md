# AFERIX PERMISSION MATRIX (RoleFeatureMatrix)

A matriz de permissões define as operações (CRUD) e ações avançadas que cada papel pode exercer no sistema. **Segurança por design: se o perfil não tem a permissão, o componente de UI nem deve ser renderizado (esconder, não desabilitar).**

## LEGENDA
- **(R)** Read: Acesso de visualização
- **(C)** Create: Pode criar registros
- **(U)** Update: Pode editar registros
- **(D)** Delete: Pode excluir
- **(A)** Approve: Poder de decisão final (Aprovação Financeira / Técnica)
- **(E)** Export: Pode exportar relatórios / dados

---

| Feature / Módulo | OWNER | MANAGER | SALES | FIELD | CUSTOMER |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Financeiro Global** | R,C,U,D,E | - | - | - | - |
| **Relatórios Executivos** | R,E | - | - | - | - |
| **Config. Empresa** | R,C,U,D | R | - | - | - |
| **Contratos (PMOC)** | R,U | R,C,U | - | - | R (Apenas os dele) |
| **CRM / Clientes** | R,C,U,D,E | R,C,U | R,C,U | R (Acesso restrito à O.S) | - |
| **Propostas Comerciais** | R,U,A | R | R,C,U,A | - | R,A (Apenas aprovar) |
| **O.S (Execução)** | R | R,C,U,D | - | R,U (Apenas apontar) | R (Apenas laudo) |
| **Agenda / Dispatch** | R | R,C,U | - | R (Apenas sua agenda) | - |
| **Checklists (Forms)** | R | R,C,U | - | R,U (Preencher) | - |
| **Ativos / Equipamentos** | R | R,C,U | R | R,C (Cadastrar em campo) | R |
| **Estoque** | R,C,U,E | R,C,U | - | R (Visualizar peças OS) | - |

## REGRAS DE ISOLAMENTO
1. **FIELD não deleta.** O técnico em campo apenas *lê* sua rota e *atualiza* checklists e anomalias. Se um erro ocorrer, ele aciona o MANAGER para estorno/exclusão.
2. **SALES não visualiza agenda técnica.** O funil comercial é o limite.
3. **CUSTOMER Sandbox.** O Cliente vê única e exclusivamente dados atrelados ao seu `clientId`. Qualquer falha de filtro aqui é tratada como incidente crítico de vazamento de dados.
4. **OWNER tem "God Mode" sem ruído.** O dono pode ver e editar tudo, mas a *visão padrão* dele esconde a complexidade. Ele não precisa ver o passo a passo da checklist do técnico, a não ser que faça *drill-down*.
