# AFERIX ERP PREMIUM — MOTOR DE CRESCIMENTO PLG (FASE 5)
`STATUS: PLANEJADO | PAPEL: PRODUCT-LED GROWTH SPECIALIST & SAAS FOUNDER`
`DIRETRIZ TÉCNICA: AUTOMAÇÃO DO FUNIL DE PRODUTO | SELF-SERVICE ENGINE`

Este documento apresenta a **Estratégia de Automação de Crescimento Baseada em Produto (Product-Led Growth)** do Aferix ERP Premium. Mapeamos os gargalos operacionais que exigem intervenção manual do fundador e estabelecemos a engenharia de self-service para sustentar a escala sem atrito humano.

---

## 1. DESACOPLAMENTO DA OPERAÇÃO (ELIMINAÇÃO DE ATRITO HUMANO)

Atualmente, o processo de onboarding do Aferix depende de suporte consultivo do time de Customer Success. Para atingir escala, eliminamos a dependência humana em todas as etapas chaves da jornada do cliente:

| Etapa Operacional | Como é feito hoje (Fricção) | Automação Proposta (PLG Engine) |
| :--- | :--- | :--- |
| **Cadastro de Usuário** | Gestor solicita por WhatsApp. O CS cria a conta manualmente no banco. | Formulário de Sign-Up público usando **Supabase Auth** com geração automática de UUID de `company_id`. |
| **Onboarding Inicial** | Reunião de 30 minutos via Meet para explicar como importar planilhas. | Fluxo interativo PWA em 3 etapas guiadas: (1) Adicionar Cliente $\rightarrow$ (2) Adicionar Site $\rightarrow$ (3) Importar Ativos em CSV. |
| **Ativação Técnica** | CS ajuda a montar o primeiro cronograma PMOC localmente. | Modelo pronto (Template) de checklist legal padrão ANVISA gerado automaticamente no primeiro clique. |
| **Trial de 14 Dias** | CS controla a expiração de forma manual no banco. | Coluna `trialEndsAt` no IndexedDB/Supabase. PWA exibe faixa superior contendo contagem regressiva e aviso de bloqueio. |
| **Assinatura e Pro** | CS envia link de checkout manual por e-mail ou PIX mensal. | Painel de Faturamento integrado ao **Stripe Portal**, permitindo compra de licenças (seats) em tempo real. |

---

## 2. ROADMAP DE IMPLEMENTAÇÃO DA ENGENHARIA SELF-SERVICE

Mapeamos a lógica de execução técnica da automação das etapas:

### A. Cadastro Automático com Auto-Provisionamento (Supabase JWT)
Durante a criação de conta no frontend, a chamada de registro envia metadados que acionam um trigger PostgreSQL para instanciar a estrutura do inquilino:
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      company_id: crypto.randomUUID(), // Novo Tenant Auto-Provisionado
      workspace_id: crypto.randomUUID(),
      role: 'coordinator'
    }
  }
});
```

### B. Ativação Técnica Baseada em Templates
No primeiro login, o sistema pré-popula a base local IndexedDB com templates regulamentados de checklists PMOC. Isso permite que o técnico execute uma vistoria demonstrativa em menos de **30 segundos** após abrir a aplicação, reduzindo radicalmente o Time-to-Value (TTV).

### C. Portal de Faturamento Stripe (Self-Upgrade)
No painel de configurações do PWA, a integração com o Stripe Billing gerencia assentos (seats) de forma elástica:
1. O gestor define quantos técnicos ativos estarão na rua (ex: 5 assentos).
2. O Stripe processa o cartão de crédito e envia um Webhook.
3. O Supabase atualiza os metadados do inquilino.
4. O app local do gestor recebe a atualização em tempo real via sync e libera o cadastro dos novos usuários imediatamente.

Esta arquitetura autossuficiente protege o tempo de engenharia dos fundadores e permite escalabilidade infinita de aquisição.

---
`FIM DO MOTOR DE CRESCIMENTO PLG`
