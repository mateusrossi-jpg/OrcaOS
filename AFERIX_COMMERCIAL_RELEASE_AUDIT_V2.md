# AFERIX COMMERCIAL READINESS AUDIT V2
**Data da Auditoria:** 02 de Junho de 2026
**Auditor:** Externo (BRUTAL REALITY MODE)
**Veredito Final:** 🔴 VETO (NOT AUTHORIZED FOR RELEASE)

---

## 1. SCORE REAL DE PRONTIDÃO
| Categoria | Score (0-10) | Status |
| :--- | :--- | :--- |
| **Role System** | 7/10 | Funcional na UI, frágil no Backend (RLS). |
| **Scroll First** | 9/10 | Padrão imposto com sucesso na maioria das telas. |
| **Cloud Sync** | 2/10 | **CRÍTICO.** Apenas envio (Push). Pull é um TODO. |
| **Proposal Engine** | 6/10 | Gera dados, mas o "Envio" é um mock de status. |
| **Client Portal** | 1/10 | **FALSO.** Apenas UI estática com dados fixos. |
| **Owner Workspace**| 8/10 | Visualmente pronto, carece de drill-down real. |
| **Manager Workspace**| 5/10 | Dashboard visual ok, mas Dispatch é manual. |
| **Sales Workspace** | 6/10 | Inbox de anomalias funciona, precificação é manual. |
| **Field Workspace** | 8/10 | Melhor fluxo do app. Operacional e resiliente. |
| **Solo Workspace**  | 4/10 | Reaproveita o Owner. UX não simplificada de verdade. |

**Média Ponderada: 5.6 / 10**

---

## 2. BLOCKERS P0 (IMPEDEM VENDA)

1.  **Sincronização Bidirecional Inexistente:** O `CloudSyncService` não baixa dados da nuvem. Se um Gestor criar uma OS no desktop, ela nunca aparecerá no celular do Técnico. O sistema hoje é um "Silo de Dados" com backup em nuvem, não um ERP colaborativo.
2.  **Portal do Cliente é um Mock:** Vender um portal onde o cliente "vê o histórico" é publicidade enganosa hoje. O arquivo `ClientPortalPage.tsx` contém nomes de clientes e valores de propostas hardcoded (Hospital Santa Casa, R$ 12.500).
3.  **Fluxo de Envio de Proposta Cego:** O botão "Enviar Assinatura" apenas muda o status local para `ENVIADO`. Não gera um link público, não dispara e-mail e não fornece ao cliente uma via de aceite fora do dispositivo do vendedor.
4.  **Ausência de Paywall/Stripe:** Não há código que valide se o cliente pagou a mensalidade para permitir o uso. O sistema está "aberto" para quem souber o e-mail de login.

---

## 3. RISCOS E BUGS IDENTIFICADOS

*   **Risco de Conflito (LWW fraco):** A detecção de conflitos no `CloudSyncService` baseia-se em `event_id`. Se dois técnicos editarem a mesma OS, o banco aceitará os dois eventos no Supabase, mas a reconciliação local (quando existir) falhará por falta de versionamento de documento (Optimistic Locking).
*   **Vazamento de Memória Técnica:** O `Asset360Modal` e o `ClientsWorkspace` agora são Scroll-First, mas carregam arrays inteiros de históricos sem paginação (Infinite Scroll). Em clientes com 5 anos de casa, a UI travará.
*   **Segurança (RLS):** Embora as Roles funcionem na UI, não há evidência de que um Técnico mal-intencionado não consiga ler a tabela de `budgets` (faturamento) via console do navegador acessando o Supabase Client diretamente, caso as políticas de RLS não estejam configuradas.

---

## 4. PENDÊNCIAS POR PERFIL

### FIELD
- **P1:** Botão "Ver Prontuário" na execução não permite edição rápida de TAG ou modelo.
- **P2:** Falta modo "Offline Queue Status" visível (saber se a foto subiu ou não).

### SALES
- **P1:** Gerar Link de Proposta Público (Integrado ao Supabase Storage/Functions).
- **P2:** Tabela de Preços Sugeridos (Histórico de vendas).

### MANAGER
- **P1:** Drag & Drop real no Dispatch Board. Atualmente é visual.
- **P2:** Alerta de SLA dependente de worker em nuvem (atualmente só funciona se o app estiver aberto).

### OWNER
- **P1:** Drill-down no Dashboard. Clicar no valor e ver a lista que compõe o número.
- **P2:** Visão de Fluxo de Caixa Real (Entradas vs Saídas).

---

## 5. REALIDADE VS PROMPTS (THE BRUTAL TRUTH)

*   **Prometido:** "Sistema Colaborativo com 5 técnicos e 1 gestor".
*   **Realidade:** Se os 5 técnicos trabalharem hoje, eles nunca verão o trabalho um do outro, e o gestor verá uma lista de eventos desconexos no Supabase sem conseguir consolidar o estado final da OS sem um `Pull` manual do banco.
*   **Prometido:** "Portal do Cliente Premium".
*   **Realidade:** É uma página de demonstração visual. Não serve para produção.

---

## 6. VEREDITO FINAL

**VETO.** 

O projeto Aferix/OrcaOS é uma obra-prima de **Design e Engenharia Front-end Offline-First**, mas falha miseravelmente como **Produto SaaS Colaborativo**. A fundação Cloud é uma casca de "Push" que não sustenta uma operação em equipe. 

**Recomendação de Emergência:**
Focar os próximos 15 dias exclusivamente no **Down-Sync (Pull)** e na **Conexão Real do Portal do Cliente**. Sem isso, o produto é apenas um utilitário individual de luxo.
