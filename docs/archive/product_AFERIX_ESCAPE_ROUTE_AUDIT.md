# AFERIX ESCAPE ROUTE AUDIT
**Foco:** Mapear onde e por que a operação abandona o Aferix e usa processos paralelos.

### Fugas Detectadas e Bloqueios Recomendados

#### FUGA 1: O WhatsApp do Técnico para o Comercial (Orçamentos)
* **Status Antigo:** O técnico achava um problema e mandava áudio ou foto no WhatsApp corporativo. O comercial cobrava os detalhes dias depois e montava no Word/PDF.
* **Solução Aferix Implementada:** A engine de Anomalias obriga a foto + checklist direto na tela de execução. O sistema cria a Inbox Comercial automaticamente.
* **Gap Restante:** Falta de sinal do técnico (sanado pelo Offline-First) ou preguiça do técnico de preencher formulário (mitigado forçando dropdowns rápidos em vez de texto livre).

#### FUGA 2: Compras de Emergência na "Ponta da Esquina"
* **Status Antigo:** Técnico liga pro gestor: "Falta gás/contatora". Gestor manda comprar na loja e pedir nota, embolando financeiro.
* **Solução Aferix Implementada:** Inventory Reservation e Procurement automático a partir da Anomalia.
* **Gap Restante:** Urgência imprevisível.
* **Resolução UX:** O técnico deve ter um botão "Compra Emergencial" na OS que aprova *auto-expense* e abate do lucro da OS automaticamente no Engine. (A incluir no roadmap menor).

#### FUGA 3: Relatórios de Cliente Final (PDFs Manuais)
* **Status Antigo:** O gestor extrai fotos do app, junta num PDF e manda pro cliente.
* **Solução Aferix:** Client Portal. O cliente acessa tudo via link na timeline, sem PDFs.
* **Gap Restante:** Cliente pede o PDF "para o sistema interno deles".
* **Resolução UX:** Aferix gera o PDF com a mesma identidade do Client Portal nativamente e envia com 1 click.

### CONCLUSAO
Não há mais fugas estruturais no Aferix. As fugas restantes são vícios operacionais humanos (preferência por ligação em vez de registro). O sistema será punitivo nesses casos: se não foi documentado no Aferix, não será faturado.
