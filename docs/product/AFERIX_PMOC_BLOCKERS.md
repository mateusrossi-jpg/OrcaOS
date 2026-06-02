# AFERIX — REGISTRO DE BLOQUEADORES OPERACIONAIS PMOC
**Status:** CONGELADO E RATIFICADO  
**Objetivo:** Localizar os Arquivos e Componentes que Bloqueiam a Primeira Venda

---

## 🛑 DETALHAMENTO DE BLOQUEADORES TÉCNICOS (MVP BLOCKERS)

Para preparar a aplicação para a primeira cobrança real, mapeamos os componentes exatos do código que precisam ser modificados ou criados na primeira quinzena de desenvolvimento:

---

### Blocker 1 (P0): Inexistência do Laudo Técnico PMOC nos Padrões ANVISA
* **Gravidade:** P0 (Bloqueio total - o cliente não aceita o PDF comercial de orçamento).
* **Arquivo Afetado:** `src/features/reports/components/ReportWorkspace.tsx`
* **Descrição Técnica:** O exportador atual de PDF no `@react-pdf/renderer` gera apenas um layout de orçamento de materiais comercial.
* **Componente a Criar:** Criar `src/features/reports/components/PmocTechnicalReportPdf.tsx` que estruturará a tabela regulamentar de identificação de ambientes, marca do compressor, verificação física dos 12 itens obrigatórios da portaria MS nº 3.523/98 da ANVISA e campo para inserção manual do CFT/CREA e assinatura do responsável técnico.

---

### Blocker 2 (P0): Ausência da Interface de Preenchimento de Checklist de Campo
* **Gravidade:** P0 (Bloqueio total - o técnico não consegue responder às vistorias dos ar-condicionados).
* **Tela/Componente Afetado:** `src/features/execution/components/ExecutionWorkspace.tsx` e `AssetCaptureModal.tsx`
* **Descrição Técnica:** A tela de execução física atual (`ExecutionCockpit.tsx` / `ExecutionTimeline.tsx`) exibe apenas uma timeline de atividades ("técnico chegou", "iniciou") e fotos, mas não expõe os itens de checklist do ativo para marcação física `SIM/NÃO/N.A`.
* **Componente a Criar:** Desenvolver `src/features/execution/components/ChecklistExecutionPanel.tsx`. Trata-se de uma lista high-density de toque rápido com botões deslizantes de status de conformidade para o técnico marcar de forma sequencial na escada.

---

### Blocker 3 (P0): Falta da Coleta Canvas de Assinatura Tátil
* **Gravidade:** P0 (Bloqueio total - o laudo de preventiva PMOC não tem validade jurídica perante a Vigilância Sanitária sem a assinatura do cliente final).
* **Componente Afetado:** Novo componente sob `src/app/components/ui/`
* **Descrição Técnica:** Não existe um componente de desenho (Signature Pad) baseado em elemento HTML5 Canvas no frontend para o cliente rabiscar com o dedo na tela do celular.
* **Componente a Criar:** Desenvolver `src/app/components/ui/SignaturePad.tsx`. Deve ser um canvas responsivo com controle de eventos de toque (`onTouchStart`, `onTouchMove`, `onTouchEnd`) e botões de `Limpar` e `Confirmar`, exportando a assinatura em string Base64 para gravação no `AssetExecution` do Dexie.

---

### Blocker 4 (P0): Integração de Compartilhamento WhatsApp
* **Gravidade:** P0 (Bloqueio operacional - sem isso, o técnico precisa baixar o arquivo no gerenciador do celular e caçar o WhatsApp do cliente para enviar).
* **Tela/Componente Afetado:** `src/features/execution/components/ExecutionQuickActions.tsx` e `HomeScreen.tsx`
* **Descrição Técnica:** Falta um acionador direto que leia o PDF gerado localmente e dispare a URL nativa do WhatsApp (`whatsapp://send` ou `https://api.whatsapp.com/send`).
* **Resolução:** Integrar um botão de compartilhamento rápido no cockpit de OS finalizada. O clique dispara a chamada de compartilhamento do sistema (`navigator.share` se disponível em ambiente móvel) com fallback para o link de WhatsApp API formatado com mensagem personalizada: *"Olá, segue o Laudo Técnico PMOC da vistoria mensal concluída hoje de seus ar-condicionados: [link]"*.

---

### Blocker 5 (P1): Carga do Template Mestre ANVISA no Bootstrap
* **Gravidade:** P1 (Fricção crítica - se o técnico abrir o app vazio, desiste antes do primeiro teste).
* **Arquivo Afetado:** `src/storage/dexieDatabase.ts`
* **Descrição Técnica:** A tabela local Dexie inicia vazia no primeiro login da conta.
* **Resolução:** Inserir triggers no carregamento inicial (`src/services/accountPlanService.ts` ou similar) para verificar se o banco de checklists locais está vazio. Em caso positivo, popular com a lista regulamentar padrão da Vigilância Sanitária contendo os 12 itens críticos (limpeza de filtros, verificação física de bandeja, dreno, serpentina, fiação, etc.).
