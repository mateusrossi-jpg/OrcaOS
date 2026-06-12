# AFERIX RELEASE BLOCKERS (MVP HARDENING)

## CRITÉRIOS PARA PRIMEIRO CLIENTE REAL
Lista definitiva de impedimentos arquiteturais e de UX que quebram ou travam o uso diário de 8h do sistema.

### [BLOCKER-001] Invisibilidade da Camada de Gestão (Clientes, Contratos, Ativos) (DONE)
* **Problema:** A navegação inferior (`AppShell.tsx`) blindou o acesso às telas administrativas (`MenuScreen/Settings`, `Catalog`, `Clients`).
* **Por que impede o lançamento:** O usuário pode até executar uma OS "Expressa", mas depois não consegue achar a ficha do cliente para faturar contrato ou consultar a base de ativos. O sistema virou um "to do list" glorificado.
* **Resolução Obrigatória:** Restaurar o link para Settings (Menu Global) ou Client Workspace na barra de navegação principal, ou criar um "Menu Hamburguer" centralizador.

### [BLOCKER-002] Fluxo de Campo Incompleto (Sem Evidências e Checklist) (DONE)
* **Problema:** O técnico consegue encerrar a OS apertando um botão de PIX/Dinheiro. Não há como tirar fotos da anomalia, preencher checklist obrigatório, nem pegar assinatura do cliente no aparelho.
* **Por que impede o lançamento:** Um ERP de manutenção em que o técnico não prova que consertou a máquina gera recusa de pagamento.
* **Resolução Obrigatória:** Adicionar as abas ou modais de Evidências (Câmera) e Checklists antes do Checkout final.

### [BLOCKER-003] Uso de `window.confirm` e Alertas Nativos (DONE)
* **Problema:** O App exibe `confirm('Iniciar a execução...')`.
* **Por que impede o lançamento:** Isso quebra o App no iOS (PWA), reduz a confiabilidade e parece amador, destruindo a percepção do "Design System Aferix Premium".
* **Resolução Obrigatória:** Trocar todos os `window.confirm` e `alert()` por modais próprios da UI.

### LIMPEZA DE MVP (FASE 13)
* **Pergunta Brutal:** Existe algo que se removermos ninguém deixará de pagar?
* **Resposta:** A simulação de Faturamento Express via OS "Nova OS Expressa". Clientes premium querem faturamento organizado (Orçamento -> Aprovação -> OS), não apenas um botão cego. Contudo, serve para test drive.
