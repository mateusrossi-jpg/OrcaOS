# AFERIX PLATFORM ARCHITECTURE V1
**Sistemas:** Aferix, OrçaOS & ENDAP  
**Função:** Camada Compartilhada de Infraestrutura e Serviços Core (SaaS Platform Layer)  
**Status:** CONGELADO E RATIFICADO

---

## 🏛️ VISÃO GERAL DA PLATAFORMA (HUB & SPOKE)
A **Aferix Platform** é a espinha dorsal de infraestrutura comum que suporta o ecossistema. Ao isolar regras de negócio comerciais no **OrçaOS** e telecomunicações de IoT no **ENDAP**, a plataforma centraliza todas as capacidades transversais necessárias para um SaaS multi-tenant escalável.

```text
 ┌────────────────────────────────────────────────────────┐
 │                   AFERIX PLATFORM                      │
 ├────────────┬─────────────┬──────────────┬──────────────┤
 │  Identity  │   Billing   │ Notification │  Audit Logs  │
 │   & SSO    │ & Subscriptions│    Engine    │  & Security  │
 └─────┬──────┴──────┬──────┴──────┬───────┴──────┬───────┘
       │             │             │              │ (APIs/Eventos)
 ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐        │
 │  Aferix   │ │  OrçaOS   │ │   ENDAP   │        │
 │   (Hub)   │ │  (Spoke)  │ │  (Spoke)  │◄───────┘
 └───────────┘ └───────────┘ └───────────┘
```

---

## 1. IDENTITY & SINGLE SIGN-ON (SSO)
Para evitar que o usuário gerencie credenciais diferentes para cada produto, a plataforma implementa um serviço centralizado de identidade federada:

* **Identity Provider (IdP):** Baseado em **Supabase Auth** estendido com suporte OAuth2/OIDC.
* **Mapeamento de Usuário Global:** A tabela `platform_users` centraliza perfis, avatares, status de e-mail e hashes de autenticação.
* **Single Sign-On (SSO):** Uma única sessão ativa no navegador ou aplicativo móvel concede acesso imediato ao Aferix, OrçaOS e ENDAP por meio de JSON Web Tokens (JWT) centralizados, assinados digitalmente com chaves rotativas assimétricas RS256.

---

## 2. ORGANIZATIONS & WORKSPACES (TENANCY MODEL)
A plataforma gerencia o isolamento de dados de forma estrita em duas camadas físicas e lógicas:

```text
[ Global Platform User ]
           │ (N:M)
           ▼
   [ Organization ]  ◄── Dono das Contas e Assinatura (Faturamento Stripe)
           │ (1:N)
           ▼
     [ Workspace ]   ◄── Isolamento Lógico de Dados (Dexie local, RLS Supabase)
```

1. **Organization (Organização / Conta Legal):**
   * Corresponde à entidade jurídica pagadora da assinatura.
   * Centraliza as regras de **Billing**, planos de cobrança, faturas e métodos de pagamento.
   * Controla a lista global de colaboradores convidados para a empresa.
2. **Workspace (Ambiente de Trabalho / Filiais):**
   * Uma organização pode possuir múltiplos Workspaces (ex: Filial São Paulo, Filial Rio, Operação Predial Exclusiva).
   * O isolamento de dados reside no Workspace. Registros como `Client`, `WorkOrder`, `Budget`, `Device` pertencem a um único `workspace_id`.
   * Técnicos de campo podem ser vinculados a Workspaces específicos, impedindo que visualizem dados de outras filiais.

---

## 3. ROLE-BASED ACCESS CONTROL (RBAC) GLOBAL & LOCAL
As permissões são distribuídas em dois níveis hierárquicos:

### A. Papéis Organizacionais (Plataforma)
* **Owner:** Controle total do faturamento, exclusão da organização, contratação de add-ons e convite de administradores.
* **Administrator:** Adiciona/remove colaboradores, cria Workspaces, ajusta configurações de integrações e visualiza auditorias de faturamento.
* **Billing Admin:** Acesso exclusivo para alteração de cartões, download de notas fiscais e gerenciamento do plano Stripe.

### B. Papéis de Produtos (Workspaces)
Os usuários recebem permissões granulares por produto dentro de cada Workspace:

* **Aferix ERP Permissions:**
  * `manager`: Programação de agenda, criação de contratos, fechamento financeiro.
  * `dispatcher`: Despacho de ordens de serviço, agendamento de atendimentos.
  * `field_technician`: Acesso offline-first via celular para preenchimento de OS, checklists operacionais, coleta de assinaturas e fotos.
* **OrçaOS Permissions:**
  * `commercial_manager`: Ajuste de tabelas de markup, markup global, catálogo de materiais e aprovação de propostas de alta margem.
  * `estimator`: Elaboração de propostas e envio para clientes.
* **ENDAP Permissions:**
  * `automation_engineer`: Acesso completo ao Studio, compilação de firmware, testes de registradores CLP Modbus e parametrização de IoT.
  * `operator`: Monitoramento passivo de telemetria e gráficos.

---

## 4. BILLING & SUBSCRIPTION ENGINE
Motor automatizado de faturamento recorrente integrado com **Stripe**:

* **Usage Metering:** O Billing Service monitora limites em tempo real (número de usuários ativos, quantidade de ativos cadastrados, volumetria de dados de sensores IoT).
* **Payment Gateway:** Gateway centralizado de pagamentos suportando Cartão de Crédito, PIX Recorrente e boleto bancário estruturado.
* **Dunning & Grace Periods:** Sistema de cobrança proativa. Se o pagamento do Stripe falhar, a plataforma entra em estado de `GRACE_PERIOD` de 5 dias úteis, notificando via in-app e WhatsApp o Owner antes de bloquear as operações operacionais.

---

## 5. NOTIFICATIONS ENGINE (CENTRAL DE DISPACHO)
Interface comum para entrega de notificações com priorização de filas baseada na urgência:

* **In-App Alerts:** Toasts táteis de alta velocidade no app Aferix.
* **Mobile Push Notifications:** Entrega via APNs (Apple) e FCM (Google) para técnicos em campo sob condições severas de conexão.
* **Channels Externos:**
  * **WhatsApp API Gateway:** Envio de propostas comerciais (OrçaOS) e PDFs de relatórios PMOC concluídos diretamente para o WhatsApp do cliente final.
  * **Email (SMTP/Postmark):** Envio de faturas em PDF e relatórios semanais corporativos.

---

## 6. AUDIT LOGS & SECURITY LEDGER
Registro de auditoria imutável gravado de forma linear na tabela central `platform_audit_logs`. Uma vez inserido o log de auditoria, ele torna-se somente-leitura (bloqueado para edição ou deleção por RLS):

* **Eventos Auditáveis Obrigatórios:**
  * `auth.login_failed` e `auth.password_changed`
  * `billing.subscription_changed` e `billing.payment_failed`
  * `security.firmware_flashed` (ENDAP)
  * `security.rbac_role_elevated`
  * `operational.budget_approved` (OrçaOS)
  * `operational.wo_closed` (Aferix)
* **Estrutura do Audit Log:**
  ```json
  {
    "id": "uuid-v4",
    "timestamp": "ISO8601-UTC",
    "user_id": "uuid",
    "workspace_id": "uuid",
    "event_type": "security.rbac_role_elevated",
    "actor_ip": "string",
    "user_agent": "string",
    "payload_diff": {
      "role": ["field_technician", "manager"]
    }
  }
  ```

---

## 7. FEATURE FLAGS & PROGRESSIVE ROLLOUTS
Serviço interno para chaveamento de recursos sem necessidade de deploy:

* **Plan Gates:** Habilitação de telas baseada na assinatura do cliente (ex: o painel PMOC está ativo apenas se a feature flag `addon.pmoc` for verdadeira).
* **Canary Releases:** Rollout gradual de novas versões (ex: liberar a nova visualização de Menu de atendimento para apenas 5% das contas Professional da vertical Climatização).
* **Local Caching:** O cliente Aferix mantém cache local das flags de funcionalidades ativas por 24 horas para garantir funcionamento offline contínuo.
