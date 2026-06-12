# AFERIX — FLUXO DO CLIENTE E PONTOS QUEBRADOS
**Status:** CONGELADO E RATIFICADO  
**Objetivo:** Mapear o Fluxo Crítico de Monetização e Eliminar Bloqueios de Conversão

---

## 🏛️ JORNADA DO TÉCNICO: DO CADASTRO AO PAGAMENTO

Abaixo está o mapeamento visual do fluxo de ponta a ponta que o proprietário da empresa de climatização realiza, seguido pelos pontos de fricção ou bloqueio técnico na versão atual do sistema:

```text
  [ Lead GTM ]       ──► [ Canal orgânico do WhatsApp / Grupos PMOC ]
       │
       ▼
  [ Cadastro ]       ──► [ Onboarding simplificado pelo celular ]
       │
       ▼
  [ Criar Cliente ]  ──► [ Cadastro do hospital, shopping ou prédio corporativo ]
       │
       ▼
  [ Criar Ativo ]    ──► [ Registro do ar-condicionado (Marca, BTU, Localização) ]
       │
       ▼
  [ Criar OS ]       ──► [ Agendamento e despacho da preventiva mensal ]
       │
       ▼
  [ Preencher OS ]   ──► [ Checklist técnico operacional de campo ANVISA ]
       │
       ▼
  [ Gerar PDF ]      ──► [ Garanha do laudo técnico assinado pelo cliente ]
       │
       ▼
  [ Cobrança ]       ──► [ Fim dos 14 dias de Trial -> Bloqueio por Paywall ]
```

---

## 🛑 PONTOS QUEBRADOS DETECTADOS NA ARQUITETURA ATUAL (BLOCKERS)

Auditamos a base de código e os fluxos de telas atuais e identificamos as seguintes falhas graves que impedem o faturamento real nos próximos 30 dias:

### 1. Fricção de Cadastro e Onboarding (O "App Vazio")
* **O Problema:** Quando o técnico conclui o cadastro inicial, o aplicativo abre uma interface em branco. Ele precisa criar manualmente cada checklist, digitar as descrições dos itens de preventiva e configurar o cabeçalho do PMOC do zero. O técnico desiste em 3 minutos devido à sobrecarga de trabalho operacional.
* **A Resolução:** Injetar no bootstrap do aplicativo (`dexieDatabase.ts` / `accountPlanService.ts`) uma rotina de carga atômica de banco de dados que detecta se a conta é nova e insere automaticamente:
  * Um cliente de exemplo ("Edifício Comercial Paulista").
  * Dois ativos de climatização pré-configurados.
  * O template oficial de **Checklist Regulamentar ANVISA de PMOC** pronto para preenchimento.

### 2. Ausência do Mapeamento "Ativo x Checklist de Execução" na UI
* **O Problema:** A interface atual foca na edição básica de orçamentos e despesas financeiras. Não há uma tela otimizada para o técnico móvel com botões grandes de SIM/NÃO/NÃO-APLICÁVEL para vistoriar múltiplos condicionadores de ar em sequência com apenas uma das mãos no topo da escada.
* **A Resolução:** Otimizar o componente de execução de checklist (`AssetCaptureModal.tsx` / `FieldWorkTool.tsx`) para operar em modo de "alta densidade e toque rápido", com tamanho de clique mínimo de `44px x 44px` (padrão de ergonomia móvel do iOS/Android).

### 3. Falta de PDF Técnico Formatado nos Padrões de Laudo ANVISA
* **O Problema:** O motor de PDF do Aferix está configurado para emitir "Propostas Comerciais e Orçamentos de Materiais". Um cliente do técnico de climatização não aceita um orçamento de peças como comprovante do PMOC exigido pela Vigilância Sanitária.
* **A Resolução:** Criar um template específico de PDF técnico (Laudo Mensal de Manutenção Regulamentada PMOC) que exiba:
  * Cabeçalho de identificação da edificação.
  * Tabela condensada dos ar-condicionados com os respectivos status de limpeza, verificação de drenos, filtros e carga de fluido.
  * Assinatura digital coletada do cliente final.
  * Número do registro de conselho de classe (CREA/CFT) do Responsável Técnico.

### 4. Fragilidade de Sincronismo da Base Offline-First
* **O Problema:** O prestador de serviço tem pavor absoluto de perder o histórico das OSs e checklists de PMOC do ano inteiro de seus clientes caso o celular seja roubado, derrubado da escada ou sofra um reset. A falta de um backup transparente na nuvem impede qualquer prestador sério de pagar pelo sistema.
* **A Resolução:** Consolidar a replicação de Sequence global no `CloudSyncService.ts` apontando para o Supabase. O indicador em LED verde na interface Aferix Elite deve piscar de forma ativa apenas quando a replicação for efetuada com sucesso, dando paz de espírito visual ao usuário.

### 5. Inexistência do Mecanismo de Faturamento Stripe / Pix e Paywall de Bloqueio
* **O Problema:** O MVP atual não possui tela de faturamento, gateway integrado ou limite de prazo de testes. Os técnicos podem usar o sistema infinitamente sem pagar ou, pior, não possuem nenhuma interface para colocar o cartão de crédito e virar assinantes pagantes.
* **A Resolução:** Integrar uma tela simplificada de paywall com gatilho ativado após 14 dias do cadastro (`created_at`). Habilitar um link de checkout Stripe de R$ 89,00/mês ou um botão para geração automática de QR Code PIX mensal.
