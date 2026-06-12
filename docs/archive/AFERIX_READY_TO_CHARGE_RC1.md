# TERMO DE CONGELAMENTO OPERACIONAL — AFERIX READY_TO_CHARGE_RC1

Este documento estabelece o baseline oficial do ecossistema do **Aferix**, marcando a homologação final da versão comercializável sob a tag de referência **`READY_TO_CHARGE_RC1`**. A partir desta data, o escopo técnico do produto encontra-se sob **bloqueio total de mutações (Design & Architecture Freeze)**, servindo como a base estável para o lançamento comercial.

---

## 1. ESCOPO DO CONGELAMENTO (FROZEN SCOPE)

Os seguintes módulos operacionais e de interface foram auditados e encontram-se congelados na versão **`READY_TO_CHARGE_RC1`**:

* **Home (v3.3)**: Central de comando operacional do operador de campo, contendo Hero Card da Próxima Missão, Rota Integrada, Agenda Compacta, Ações Rápidas (com destaque a *Nova Proposta*) e Atenção Necessária.
* **Agenda (v28)**: Painel de execução contendo visualização *"Executando Agora"*, botão primário *"CONTINUAR"*, ações secundárias (Checklist, Evidências, Finalizar) e Jornada do Dia.
* **Checklist (PMOC)**: Workspace de rotinas de manutenção preventiva e corretiva com vinculação de ativos e TAGs.
* **Evidências (Diagnostics)**: Registro de laudos técnicos, fotos de comprovantes e detecção de anomalias em campo.
* **Assinatura (Unified Canvas)**: Canvas digital de alta precisão sobreposto para captura e aceite de vistorias pelo cliente.
* **Recebimento (Ledger)**: Caixa de faturamento e registro de quitação de ordens de serviço.
* **Financeiro (SimpleFinance)**: Fluxo de caixa simplificado, cálculo de margem real de lucro e controle de meta mensal.
* **Offline Sync (Reconciliation)**: Sincronização local-first reativa baseada em fila FIFO e reconciliação causal Last-Write-Wins (LWW) via Supabase.

---

## 2. JORNADAS E FLUXOS APROVADOS (BASELINES VALIDADOS)

1. **Jornada de Campo Resiliente**: Abertura de OS offline ──> Execução de Checklist ──> Registro de fotos ──> Assinatura do cliente ──> Sincronização em nuvem silenciosa pós-reconexão.
2. **Cálculo de Margem Real**: Dedução de custos de materiais, transporte e taxas de cartão com exibição de lucro líquido dinâmico em tempo de orçamento.
3. **Autocura e Crash Recovery**: Reabertura segura de tabelas Dexie no boot do app, reparando travas de conexões corrompidas e resgatando registros da fila `'in-flight'`.

---

## 3. LIMITAÇÕES CONHECIDAS E RISCOS ACEITOS

Para a release **`READY_TO_CHARGE_RC1`**, foram mapeadas as seguintes limitações e aceitos seus riscos devido ao baixíssimo impacto operacional:

| Código | Descrição da Limitação | Severidade | Risco / Mitigação |
| :--- | :--- | :---: | :--- |
| **LIM-01** | *LWW Clock Bias*: Conflitos multi-dispositivo dependem dos relógios locais dos aparelhos. | **P2** | Aceito. O operador individual (Solo) raramente atua em múltiplos aparelhos simultâneos. |
| **LIM-02** | *Safari Keyboard Overlay*: Teclado virtual do iOS pode cobrir botões do rodapé fixo. | **P2** | Aceito. O usuário se recupera rolando a tela ou fechando o teclado numérico. |
| **LIM-03** | *PDF Resize Delay*: Atraso de 1.2s ao renderizar proposta PDF em rotação de tela. | **P3** | Aceito. Impacto puramente cosmético, sem interferência em downloads. |
| **LIM-04** | *Timeout em 2G/3G*: Lentidão em uploads de pacotes de fotos massivos em sinal fraco. | **P3** | Aceito. O app retenta automaticamente em background sob backoff exponencial. |

---

## 4. CRONOGRAMA DE CORREÇÕES PENDENTES (POST-RELEASE BACKLOG)
As seguintes melhorias de usabilidade de baixo impacto foram catalogadas para sprints pós-lançamento comercial (não afetando a tag `READY_TO_CHARGE_RC1`):
1. Mock de `localStorage` na suíte de testes globais do Vitest para limpar alertas do console no `CelebrationService`.
2. Compactação automática de imagens antes do salvamento local-first no banco Dexie.
3. Tratamento de offset de tempo do relógio local comparado com o servidor do Supabase.

---

## 5. CONCLUSÃO DE GOVERNANÇA

**BASELINE ESTABELECIDO**: **`READY_TO_CHARGE_RC1`**

Fica expressamente **PROIBIDO** alterar fluxos, modificar tabelas de banco de dados, inserir novos wrappers de UX ou criar novos módulos no código do Aferix sem aprovação prévia do comitê de governança de arquitetura. O aplicativo encontra-se consolidado para lançamento e início da expansão comercial.
