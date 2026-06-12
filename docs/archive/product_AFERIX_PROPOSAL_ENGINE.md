# AFERIX PROPOSAL ENGINE
**O Kanban Comercial (Caçando Corretivas)**

## 1. O Inbox Comercial (Kanban)
O gestor/comercial abre a "Máquina de Vendas". A interface não é uma tabela entediante, é um Kanban focado em fechar negócios.
Colunas:
*   **OPEN (Para Orçar):** Anomalias quentinhas que os técnicos acabaram de encontrar.
*   **QUOTED (Aguardando Aceite):** Orçamentos enviados.
*   **APPROVED (Vendidas):** Dinheiro na mesa, aguardando execução (Corretiva).
*   **REJECTED (Perdidas):** Cliente não quis arrumar.

**Como evitar cemitério de Backlog?**
Cartões na coluna `OPEN` e `QUOTED` ficam vermelhos após 48 horas. Velocidade = Conversão.

## 2. Zero Redigitação (A Geração Automática)
Quando o Gestor arrasta um Cartão de `OPEN` para `QUOTED` (ou clica "Gerar Proposta"), o Aferix aciona o Merge Engine:
*   **Manual (O que o gestor faz):** Digita "R$ 800,00" no campo de Preço.
*   **Automático (O que o sistema faz em 0,5 segundos):**
    *   Cria a Proposta vinculando o Cliente e Local.
    *   O "Título da Proposta" vira: *"Correção de Anomalia: Vazamento - Ar Condicionado Sala 2"*.
    *   A "Recomendação" do técnico (via voz) vira o Escopo do Serviço ("Trocar porca e colocar gás R410").
    *   As Fotos da Anomalia são embedadas na proposta.

O gestor economiza 15 minutos de WhatsApp, download de fotos, redação de Word e PDF para cada orçamento. Em vez disso, gera a proposta em **30 segundos** e aperta "Enviar Link".
