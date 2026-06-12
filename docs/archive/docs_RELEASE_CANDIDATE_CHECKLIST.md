# Aferix — Release Candidate Checklist (v0.1.0-rc.1)

## Metadados da Release
* **Versão Candidata:** `0.1.0-rc.1`
* **Release Channel:** `pilot`
* **Release Candidate:** Sim (True)
* **Hash do Commit Base:** `654deebf07f810887c522d004daaf8c2f716345f`
* **Data:** 26 de Maio de 2026

---

## Escopo do MVP
O Aferix é um ERP financeiro mobile-first voltado para autônomos e prestadores de serviços, focado em fechar o ciclo desde a captação do cliente até a finalização do serviço e apuração de lucro real.

### O que está incluído:
1. **Orçamento e Proposta:** Criação passo a passo com fluxo linear (Projeto, Escopo, Custos, Comercial e Proposta), visualização de PDF.
2. **Cadastro de Clientes:** Painel básico com controle de limite de crédito e histórico de atendimentos.
3. **Ordem de Serviço (OS):** Controle simples de status da ordem de serviço.
4. **Área de Execução (Campo):** Início, Pausa, Conclusão de OS e linha do tempo de eventos operacionais.
5. **Upload de Evidências:** Fila offline de fotos de evidência com prevenção de duplicação.
6. **Financeiro Simples:** Registro de custos, receitas, cálculo centralizado de lucro bruto/líquido e margens de projeto.
7. **Relatórios Consolidados:** Apuração de lucratividade operacional e faturamento para o prestador.
8. **Reconciliação e Sync Offline:** Mecanismo local de Version Vector para sincronização idempotente e reconexão segura.
9. **Telemetria de Atrito (Métricas locais):** PilotUsageMetrics integrado e privacy-safe para medir o uso e network drops.

### O que NÃO está incluído:
* Sincronização em nuvem real ativa (Supabase/Websocket estão na base/foundation mas não habilitados para produção ativa).
* Emissão de Notas Fiscais de Serviço (NFS-e/NCM/CFOP) ou módulo fiscal ativo.
* Dashboard analítico complexo multi-empresa.
* Integrações com gateway de pagamento ativo além de simulação estruturada.

---

## Riscos Conhecidos & Limitações
1. **Limitação de Armazenamento Local:** Como o banco principal roda local no Dexie (IndexedDB), limpezas extremas de dados pelo navegador/OS (especialmente em iOS quando o storage fica cheio) podem apagar os dados caso o usuário não faça backups manuais frequentes.
2. **Backups Manuais:** O backup em nuvem (Google Drive) é simulado/foundation, exigindo que o usuário exporte arquivos JSON locais.
3. **SLA e Relógio do Dispositivo:** A validação de tempo de SLA depende do relógio do sistema operacional do aparelho. Alterações manuais de horário podem distorcer a linha do tempo operacional.

---

## Checklist de Testes Manuais

### 1. Checklist Mobile (Mobile-First Layout)
* [ ] **Viewport Check:** Verificar o app em viewports móveis (ex: 375x812 e 412x915). Sem overflows laterais ou rolagem horizontal.
* [ ] **Zonas de Toque (Thumb Zones):** Botões e botões flutuantes na parte inferior da tela devem ter no mínimo 48x48px de área de toque.
* [ ] **Zonas de Contraste:** Textos sob sol ou iluminação de campo externa devem permanecer legíveis usando a paleta Dark Premium com acentos amarelo/dourado.
* [ ] **Modais e Drawers:** Modais e gavetas não devem travar o scroll vertical do app de fundo quando fechados.

### 2. Checklist Offline & Reconnect
* [ ] **Ação Offline:** Desativar a conexão de rede e registrar uma nova atividade operacional. O sistema deve continuar responsivo.
* [ ] **Anexação de Evidência:** Anexar uma foto offline. Verificar se ela entra na fila local (`evidenceUploadQueue`) com status `pending`.
* [ ] **Reconexão Simples:** Ativar a rede. Garantir que as evidências sejam processadas e marcadas como `synced` sem duplicação de chamadas.
* [ ] **Causalidade Vectorial:** O Version Vector local deve ignorar ecos locais e integrar apenas mensagens válidas recebidas cronologicamente de outros dispositivos associados.

### 3. Checklist Financeiro
* [ ] **Cálculos de Margem:** Registrar materiais custando R$ 300, taxas de R$ 50 e valor cobrado de R$ 1000. O sistema deve apurar exatamente R$ 650,00 de lucro operacional (gross profit) e a margem proporcional calculada de forma idêntica no form e no histórico.
* [ ] **Finalização:** Uma vez congelado/finalizado, o orçamento deve entrar em modo somente leitura (read-only) mantendo os cálculos imutáveis.

### 4. Checklist Execução & Evidências
* [ ] **Operação de Campo:** Iniciar OS (status transiciona para *Em andamento*). Pausar OS (status transiciona para *Pausado*). Concluir OS (status transiciona para *Aguardando*).
* [ ] **Histórico e Timeline:** A timeline de execução deve registrar de forma determinística os momentos exatos de transição com UUIDs robustos e não mutáveis.

### 5. Checklist Relatório
* [ ] **Geração de Documentos:** Acessar a aba de relatórios e verificar se os totais batem com o acumulado financeiro de orçamentos aprovados/finalizados.
* [ ] **Visualização Limpa:** O PDF gerado na prévia de impressão do orçamento/relatório não deve conter avisos técnicos, alertas pendentes ou campos vazios.

---

## Critérios de Aprovação & Rollback

### Critérios de Aprovação para Entrada em Piloto:
1. `npm run typecheck` executa sem nenhum erro de tipagem no TypeScript.
2. `npm run lint` executa sem erros ou warnings de formatação no ESLint.
3. `npm test` passa em 100% dos testes unitários rápidos.
4. `npx playwright test` passa em 100% dos fluxos críticos integrados.
5. Sem qualquer uso ativo de diálogos bloqueantes nativos (`alert`, `confirm`, `prompt`) nas páginas de operação.

### Critérios de Rollback (Recuo do Piloto):
* Ocorrência de corrupção ou perda de dados locais no Dexie sem possibilidade de recuperação.
* Divergência matemática no motor financeiro central (`aferixFinanceEngine`) entre a visualização de faturamento e a soma de itens reais do orçamento.
* Falha sistemática de renderização ou travamento de viewport em dispositivos iOS.

---

## Instruções para Coleta de Feedback de Usuários do Piloto
1. **Observação Inicial:** Deixe o autônomo usar o fluxo de cadastro e orçamento sem assistência na primeira tentativa. Registre onde há hesitação ou cliques em áreas erradas.
2. **Entrevista Pós-Uso:**
   * "Você conseguiu entender quanto de lucro real terá antes de enviar o orçamento?"
   * "O uso da tela de execução em campo é fácil de manusear com apenas uma mão?"
   * "Você sentiu falta de algum dado do seu cliente ao realizar a visita técnica?"
3. **Coleta de Logs:** Em caso de bugs reportados, instrua o usuário a acessar a seção "Sobre/Segurança" para copiar o log estruturado do `PilotUsageMetrics` e enviar via WhatsApp de suporte.
