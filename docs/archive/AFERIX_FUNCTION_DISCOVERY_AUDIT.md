# AFERIX FUNCTION DISCOVERY AUDIT

## INVENTÁRIO TOTAL DE FUNCIONALIDADES

| Nome | Onde está | Como acessar | Quantos cliques | Tempo até descoberta | Perfil que usa | Frequência de uso | Classificação |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Nova OS Expressa** | Home (Pulso) | Botão "NOVA OS EXPRESSA" na tela inicial | 1 | < 1s | Técnico/Gestor | Diária | Diária |
| **Despachar OS** | Execução (Base) | Aba Execução -> Botão "DESPACHAR OS" | 2 | 2s | Gestor Operacional | Diária | Diária |
| **Ver Agenda** | Execução (Base) | Aba Execução -> Botão "VER AGENDA" | 2 | 2s | Técnico/Gestor | Diária | Diária |
| **Iniciar Serviço** | Execução (Base) | Aba Execução -> Fila de Atendimento -> Play icon | 2 | 3s | Técnico | Diária | Diária |
| **Fast Checkout** | Execução (Base) | Aba Execução -> Ordens em Andamento -> Check icon | 2 | 3s | Técnico | Diária | Diária |
| **GPS Navegação** | Execução (Base) | Aba Execução -> Lista de OS -> Navigation icon | 2 | 3s | Técnico | Diária | Diária |
| **WhatsApp/Ligar** | Execução (Base) | Aba Execução -> Lista de OS -> Ícone Telefone/Whats | 2 | 3s | Técnico | Diária | Diária |
| **Adicionar Peças/Serviços** | Propostas (Budgets) | Aba Propostas -> Nova Proposta -> "Adicionar Item" | 3 | 5s | Comercial/Gestor | Diária | Diária |
| **Gerar PDF Proposta** | Propostas (Budgets) | Aba Propostas -> Resumo Executivo -> "Gerar PDF" | 3 | 5s | Comercial/Gestor | Diária | Diária |
| **Checkout de Execução** | Execução (Base) | Aba Execução -> Clique na OS -> Modal Checkout | 2 | 3s | Técnico | Diária | Diária |
| **Cadastro de Ativo** | Modal (Global) | Via Checkout de Execução (Automático após finalizar) | N/A | Automático | Técnico | Semanal | Diária |
| **Consultar Atendimentos** | Atendimentos | Aba Atendimentos | 1 | < 1s | Gestor/Comercial | Diária | Diária |
| **Consultar Financeiro** | Financeiro (Money) | Aba Financeiro | 1 | < 1s | Dono/Gestor | Diária | Diária |

## AUDITORIA DE DESCOBERTA E BUGS ABERTOS
Se eu instalar o app hoje, consigo encontrar:
* **Clientes:** Não óbvio no primeiro nível. A aba "clients" não está no AppShell NavigationItem (`PULSO`, `ATENDIMENTOS`, `PROPOSTAS`, `EXECUÇÃO`, `FINANCEIRO`). **[BUG ABERTO: Clientes invisíveis no menu inferior, + de 5 segundos para encontrar]**
* **Ativos:** Não há menu global evidente para "Ativos", apenas surge após finalizar OS via `AssetCaptureModal`. **[BUG ABERTO: Inventário de ativos sem acesso direto]**
* **Catálogo:** Visível apenas via "Settings" que está no App.tsx mas ausente no AppShell bottom nav. **[BUG ABERTO: Menu Catálogo não tem ícone na Menu]**
* **Diagnósticos:** Misturado na proposta comercial (Bloco 2). Fica invisível sem criar orçamento. **[BUG ABERTO: Diagnósticos ocultos sob propostas]**
* **Contratos:** Não visível em lugar algum do menu principal. **[BUG ABERTO: Falta módulo de Contratos visível]**
* **Estoque:** Não visível. **[BUG ABERTO: Módulo de estoque/store escondido sob aba settings sem link claro]**
* **Garantias:** Não visível. **[BUG ABERTO: Falta indicador claro de Garantia no app]**
* **Configurações/Perfil/Empresa:** "Entrar na Empresa" na tela Pulse, mas as Settings foram retiradas do menu (`AppShell.tsx`). **[BUG ABERTO: Aba Settings inacessível]**

**CONCLUSÃO DA FASE 1 & 2:** O foco extremo no "fluxo tático" (AppShell) limpou a tela principal, mas enterrou o acesso a entidades administrativas essenciais (Clientes, Contratos, Catálogo). O tempo de descoberta para a Gestão está inaceitável.
