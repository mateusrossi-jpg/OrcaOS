# AFERIX RBAC FLOW AUDIT

## 1. Mapeamento de Responsabilidades

| Componente | Função | Responsabilidade |
| :--- | :--- | :--- |
| **AuthService** | Persistência & SSOT | Gerencia o `localStorage` (`aferix_active_user`) e sincroniza com Dexie. |
| **useRole** | Hook Reativo | Expõe a `role` e o `user` para a UI; escuta o evento `aferix_auth_changed`. |
| **RoleShells** | Apresentação | Define o layout do Dock e as abas disponíveis para cada perfil. |
| **DebugPanel** | Ferramenta Dev | Destinada a trocar a role em runtime para testes de interface. |
| **App.tsx** | Orquestrador | Decide qual `ActiveShell` instanciar com base na role ativa. |

## 2. Diagnóstico de Falhas (Causa Raiz)

1.  **Escrita Bloqueada:** O hook `useRole` possui a função `setRole` mas ela está "mockada" com um `console.warn`, impedindo qualquer troca via DebugPanel.
2.  **Persistência Estática:** A role é lida do objeto `user` persistido. Como não há fluxo de alteração de dados do usuário logado, a role permanece a que foi definida no login original.
3.  **Lacuna de Domínio:** A role `SOLO` foi introduzida no motor de regras (`RoleFeatureMatrix`), mas não foi propagada para a lista de opções do `DebugPanel`.
4.  **Renderização Reativa:** O `App.tsx` utiliza um mapeamento estático `ActiveShell[role]`. Se a role não muda de forma reativa e persistente, o shell nunca troca.

## 3. Fluxo de Decisão do Shell (Runtime)

```typescript
// App.tsx logic flow
const { role } = useRole(); // Reads from AuthService.getActiveUser()
const ActiveShell = {
  OWNER: OwnerShell,
  SOLO: SoloShell,
  // ...
}[role] || OwnerShell; // Fallback to Owner if unknown or empty
```

## 4. Conclusão
O sistema não troca de shell porque a infraestrutura de "Troca de Perfil" (Impersonation) foi desabilitada ou nunca finalizada no hook `useRole`. Para o `SoloShell` ser exibido, o usuário deve estar logado com um perfil cuja propriedade `role` seja exatamente `'SOLO'`.
