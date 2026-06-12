# AFERIX FINAL POLISH BACKLOG
**Status:** UX Execution Mode | **Target:** Commercial Readiness (Phase 12)

Este backlog não é sobre "criar features", é sobre testar implacavelmente as experiências projetadas e anotar o atrito. Se houver hesitação, a UI falhou.

## Testes Simulados (Runbook)

### 1. FIELD EXPERIENCE (Técnico)
**Cenário:** O técnico chega no prédio, faz a OS de manutenção de um Ar Condicionado e reporta que o compressor está com barulho estranho.
- [ ] O técnico consegue ver a OS do dia logo ao abrir o app?
- [ ] O técnico consegue "Iniciar Deslocamento" em 1 clique?
- [ ] Durante a OS, ele consegue achar o botão "Criar Anomalia" sem procurar?
- [ ] Ele consegue assinar a OS e finalizar sem "Loading" eterno?
**Métricas:** Tempo total na tela. Quantidade de cliques. Dúvidas geradas.

### 2. SALES EXPERIENCE (Comercial)
**Cenário:** O comercial abre o app e vê a anomalia do compressor. Ele precisa mandar a proposta pro cliente.
- [ ] A anomalia aparece destacada no funil do Sales?
- [ ] Ele consegue gerar uma proposta com base na anomalia e adicionar o preço do compressor em menos de 2 minutos?
- [ ] É óbvio como enviar para o cliente (WhatsApp/Email)?
**Métricas:** Cliques para gerar proposta. Hesitação na precificação.

### 3. MANAGER EXPERIENCE (Gestão)
**Cenário:** Técnico liga dizendo que furou o pneu. Gestor precisa passar a OS de hoje para outro técnico amanhã.
- [ ] O gestor enxerga a OS atrasada facilmente no painel?
- [ ] É possível arrastar (Drag&Drop) ou editar a OS para outro técnico rapidamente?
- [ ] A fila de Controle de Qualidade (OS aguardando revisão) está visível?
**Métricas:** Tempo para realocar OS. Esforço cognitivo para achar o problema.

### 4. OWNER EXPERIENCE (Dono)
**Cenário:** O dono está no aeroporto, abre o celular para ver se a meta do mês bateu e se tem algo travando vendas.
- [ ] O faturamento / MRR está na cara, em fonte grande?
- [ ] Há um alerta de "2 Propostas aguardando sua aprovação de desconto"?
- [ ] Ele consegue aprovar o desconto com 1 clique?
**Métricas:** Tempo de leitura dos KPIs (Deve ser < 5s).

### 5. CUSTOMER EXPERIENCE (Cliente)
**Cenário:** O síndico recebe o link da proposta no WhatsApp, abre e precisa aprovar a troca do compressor.
- [ ] A proposta abre rápido no celular dele?
- [ ] O preço e o escopo estão claros, sem jargão interno inútil da Aferix?
- [ ] O botão "Aprovar e Assinar" funciona perfeitamente no touch?
**Métricas:** Zero contato com o suporte para "ajudar a aprovar".

---

## Log de Atritos (Para preenchimento durante os testes)
*Registre aqui toda vez que o testador perguntar "Onde eu clico agora?" ou "O que isso faz?".*

| Papel | Tela/Ação | Atrito Identificado | Solução de Design Necessária | Status |
| :--- | :--- | :--- | :--- | :--- |
| Field | Nova Anomalia | Botão escondido dentro de 3 menus | Colocar na Sticky Bar da OS | Concluído |
| Sales | Criar Proposta | Modal bloqueia visão do histórico | Mudar para Slide-over | Concluído |
| Owner | Home | Tabela de OS desnecessária na home | Remover tabela, deixar só KPIs | Concluído |
| Admin | Checklist | Checklist fixo impede personalização | Criado Checklist Builder e Persistência Dexie | Concluído |
