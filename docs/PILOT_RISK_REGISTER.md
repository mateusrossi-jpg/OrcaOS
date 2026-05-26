# Registro de Riscos do Piloto Comercial — Aferix

Este documento cataloga, analisa e propõe ações de mitigação para os riscos identificados antes e durante a fase de Piloto Comercial do Aferix.

---

## 1. Riscos de Dados & Persistência Local
* **Descrição:** Perda de dados operacionais (orçamentos, clientes, logs de execução) devido à limpeza automática de cache ou storage pelo sistema operacional (principalmente iOS) em condições de pouco espaço em disco.
* **Severidade:** Crítica
* **Probabilidade:** Média-Baixa
* **Impacto:** Alto (Perda de confiança do prestador autônomo, inviabilidade de continuar no piloto).
* **Mitigação:** Implementação de exportador manual de segurança em `LocalBackupWorkspace.tsx` permitindo que o usuário baixe um backup estruturado em formato de arquivo JSON local.
* **Status:** Mitigado (LocalBackup disponível nas configurações do app).
* **Decisão:** Avançar orientando os testadores a exportarem backups após fecharem grandes orçamentos.

---

## 2. Riscos Financeiros & Divergência de Lucros
* **Descrição:** Erros de arredondamento ou inconsistência de fórmulas entre a tela de edição de orçamento e a apuração consolidada de lucros nos Relatórios.
* **Severidade:** Alta
* **Probabilidade:** Baixa
* **Impacto:** Alto (Prestador toma decisões baseadas em lucratividade errônea, gerando prejuízo real).
* **Mitigação:** Validação rigorosa centralizada baseada em testes unitários automatizados cobrindo `calculateServiceProfit` e `budgetValidation` em todas as bordas e limites.
* **Status:** Resolvido (Todos os testes de integridade financeira passaram sem falhas).
* **Decisão:** Liberado. Cálculo centralizado no `aferixFinanceEngine.ts` garantido.

---

## 3. Riscos de UX & Operação de Campo Complexa
* **Descrição:** O usuário técnico em campo desiste de utilizar o app devido ao excesso de etapas ou menus para realizar ações simples sob condições de estresse ou pressa.
* **Severidade:** Média
* **Probabilidade:** Média
* **Impacto:** Médio (Abandono do app em campo, coleta de dados incompletos).
* **Mitigação:** Criação do `ExecutionWorkspace` otimizado: interface simplificada, sem barras laterais ou menus complexos, com botões de tamanho avantajado focados em iniciar, pausar e concluir OS com um clique.
* **Status:** Mitigado (Layout operacional validado).
* **Decisão:** Liberado para teste com foco em ergonomia.

---

## 4. Riscos Mobile-First & viewports pequenas
* **Descrição:** Quebras de layout ou sobreposições de cards em smartphones de tela pequena (ex: viewports de 320px ou 375px de largura).
* **Severidade:** Média
* **Probabilidade:** Média
* **Impacto:** Médio (Componentes impossíveis de clicar ou dados ocultos).
* **Mitigação:** Uso sistemático de CSS flexbox/grid responsivos e pílulas horizontais com scroll lateral livre. Auditoria rigorosa de viewports nos testes E2E do Playwright.
* **Status:** Resolvido.
* **Decisão:** Liberado.

---

## 5. Riscos Offline & Perda de Sincronia
* **Descrição:** Falha ao gravar logs ou registrar evidências fotográficas em locais totalmente sem internet, causando perda de arquivos.
* **Severidade:** Alta
* **Probabilidade:** Alta (Condição esperada em campo)
* **Impacto:** Alto (Evidências sumindo do relatório).
* **Mitigação:** Fila dedicada de upload com tratamento offline (`evidenceUploadQueue.ts`) que retém os dados pendentes em storage até a rede ser restabelecida.
* **Status:** Mitigado e Validado via testes unitários automatizados.
* **Decisão:** Liberado.

---

## 6. Riscos de Sincronização & Sobrescrita de Dados (Reconciliação)
* **Descrição:** Conflito de replicação ao reconectar múltiplos aparelhos, sobrescrevendo alterações legítimas de orçamentos ou gerando replays de eventos em loop.
* **Severidade:** Alta
* **Probabilidade:** Média
* **Impacto:** Médio-Alto (Dados antigos reaparecendo).
* **Mitigação:** Reconciliação causal baseada em Version Vector no `OfflineReconciliationService` que descarta envelopes redundantes e sincroniza apenas a diferença temporal causalmente correta.
* **Status:** Mitigado.
* **Decisão:** Liberado.

---

## 7. Riscos de Execução em Campo & Timestamps Erráticos
* **Descrição:** A timeline registra datas e horas distorcidas caso o dispositivo do usuário tenha alterado manualmente o relógio do sistema para fins de trapaça ou erro.
* **Severidade:** Baixa
* **Probabilidade:** Baixa
* **Impacto:** Baixo (Linha do tempo desalinhada nos logs).
* **Mitigação:** Logs e eventos salvos com timestamps locais baseados no momento exato do clique e enfileirados em formato sequencial de append-only.
* **Status:** Monitorado.
* **Decisão:** Aceito para piloto comercial.

---

## 8. Riscos de Relatórios Inconsistentes
* **Descrição:** A geração de propostas PDF exibe dados incompletos ou avisa sobre campos vazios quando impressa pelo usuário técnico para envio ao cliente.
* **Severidade:** Média-Alta
* **Probabilidade:** Baixa
* **Impacto:** Alto (Perda de credibilidade do prestador junto ao seu cliente final).
* **Mitigação:** Remoção total de popups de validação legados e renderização de PDF limpa baseada no `@react-pdf/renderer` sem dependências bloqueantes.
* **Status:** Resolvido e validado via testes integrados de PDF.
* **Decisão:** Liberado.

---

## 9. Riscos de Confiança do Usuário & Estabilidade Geral
* **Descrição:** Crash geral da aplicação em tempo de execução silencioso deixando o técnico sem saber se a ação foi gravada.
* **Severidade:** Alta
* **Probabilidade:** Baixa
* **Impacto:** Alto
* **Mitigação:** Implementação do `RuntimeErrorBoundary` no AppShell que isola a viewport quebrada e oferece botão de recuperação instantânea sem perda do cache local do Dexie.
* **Status:** Mitigado.
* **Decisão:** Liberado.

---

## 10. Riscos de Performance & Render Storms
* **Descrição:** O aplicativo fica lento ou drena a bateria excessivamente em celulares de baixo desempenho devido a re-renders repetitivos e looping de escutas do banco.
* **Severidade:** Média
* **Probabilidade:** Média-Baixa
* **Impacto:** Médio (Celular esquenta em campo, insatisfação).
* **Mitigação:** Uso consciente de hooks como `useMemo` na categorização do CRM, e set-based de-duplication na escuta das tabelas locais do Dexie.
* **Status:** Mitigado.
* **Decisão:** Liberado com monitoramento de bateria.

---

## 11. Riscos de Suporte Operacional
* **Descrição:** O time técnico não consegue entender ou debugar bugs ocorridos nos celulares dos testadores do piloto comercial.
* **Severidade:** Média
* **Probabilidade:** Média
* **Impacto:** Médio (Resolução lenta de problemas).
* **Mitigação:** Painel local de diagnóstico de uso (`PilotUsageMetrics.ts`) com exportação de dados via console estruturado e tela Sobre fácil de ler.
* **Status:** Mitigado.
* **Decisão:** Liberado.
