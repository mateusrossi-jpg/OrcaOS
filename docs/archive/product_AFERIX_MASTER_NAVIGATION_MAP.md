# AFERIX MASTER NAVIGATION MAP
**STATUS:** FROZEN
**DATE:** 2026-06-01

Este mapa consolida os únicos pontos de entrada e saída permitidos no Aferix. Qualquer caminho fora deste mapa deve ser exterminado.

## ONDE NASCE CADA ENTIDADE?

1. **Onde nasce uma OS?**
   - **Origem Única:** Motor de Despacho (Dispatch Engine). O Gestor arrasta um card de PMOC ou Corretiva para a agenda do técnico.
   - **Proibido:** Técnico não cria OS na rua. Técnico apenas executa.

2. **Onde nasce uma Anomalia?**
   - **Origem Única:** `FieldWorkspace` (Técnico). Durante um Checklist ou Execução, o técnico clica em `[ + ANOMALIA ]` (Bottom Sheet).
   - **Proibido:** Comercial não cria anomalia do zero sem vínculo com equipamento.

3. **Onde nasce uma Proposta?**
   - **Origem Única:** `SalesWorkspace` (Comercial). A partir da *Revenue Inbox*, clicando em `[ ORÇAR ]` na Anomalia reportada.
   - **Proibido:** Vendedor criando proposta "avulsa" sem anomalia atrelada. (Regra de Ouro: Sem anomalia, não há orçamento de conserto).

4. **Onde nasce um Contrato?**
   - **Origem Única:** Aprovação de uma Proposta de Manutenção Recorrente no `Client Portal`.

5. **Onde nasce uma Renovação?**
   - **Origem Única:** Automática via `Contract Engine` (Gera OS 30 dias antes do fim).

6. **Onde nasce uma Corretiva?**
   - **Origem Única:** Cliente reporta no Portal OU Anomalia virou Proposta e foi Aprovada.

7. **Onde nasce uma Compra (Procurement)?**
   - **Origem Única:** `Inventory Engine` detecta peça abaixo do estoque mínimo (Stock Rupture) e alerta no `Owner Workspace`.

8. **Onde nasce uma Garantia?**
   - **Origem Única:** Automática. Quando uma Proposta de reparo é finalizada, a `Warranty Engine` tagueia a peça trocada no `Asset 360` com o prazo legal.

## ROTAS POR PERFIL

- **TÉCNICO:** Login → Field Workspace → Iniciar Serviço → Checklist → Anomalias → Assinatura → Fim.
- **COMERCIAL:** Login → Sales Workspace → Revenue Inbox → Gerar Proposta → Enviar.
- **GESTOR:** Login → Manager Workspace → Dispatch Board / Alertas de SLA.
- **DONO:** Login → Owner Workspace → Visão Executiva (Receita/Churn).
- **CLIENTE:** Link Mágico → Client Portal → Aprovar Proposta / Baixar PDF.
