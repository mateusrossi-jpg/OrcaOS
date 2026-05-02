# OrcaOS Commercial Gate Deployment V1

Data: 2026-05-02

Checklist externo completo: `docs/ai/ORCAOS_EXTERNAL_MONETIZATION_SETUP_V1.md`.

## Objetivo

Esta etapa fecha o fluxo comercial minimo para vender logo apos o lancamento, mantendo o app preparado para integrar pagamento depois:

1. usuario cadastra e-mail proprio ou entra com Google;
2. app chama `VITE_ORCAOS_ENTITLEMENTS_ENDPOINT`;
3. endpoint consulta a tabela server-side `orcaos_subscriptions`;
4. app atualiza `accountPlanStorage`;
5. gate central libera ou bloqueia calculos Pro.

A allowlist `ORCAOS_PRO_USERS` continua disponivel apenas como fallback de beta quando Supabase ainda nao estiver configurado.

## Variaveis Do Frontend

```bash
VITE_GOOGLE_CLIENT_ID=seu_client_id_google
VITE_ORCAOS_ENTITLEMENTS_ENDPOINT=/api/entitlements
VITE_ORCAOS_ENTITLEMENTS_API_KEY=
```

`VITE_ORCAOS_ENTITLEMENTS_API_KEY` e opcional e fica exposta no frontend. Use apenas como barreira simples no beta fechado, nao como segredo forte.

## Variaveis Do Endpoint

```bash
ORCAOS_ALLOWED_ORIGIN=https://seu-dominio.com
ORCAOS_ENTITLEMENTS_API_KEY=
ORCAOS_PRO_USERS=cliente@email.com,google:123456789
ORCAOS_SUPABASE_URL=https://seu-projeto.supabase.co
ORCAOS_SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
ORCAOS_ADMIN_API_KEY=uma_chave_admin_forte
```

`ORCAOS_PRO_USERS` aceita e-mails cadastrados, e-mails Google e IDs Google salvos como `google:<sub>`.
`ORCAOS_SUPABASE_SERVICE_ROLE_KEY` e `ORCAOS_ADMIN_API_KEY` nunca devem usar prefixo `VITE_` e nunca devem ir para o frontend.

## Tabela De Assinaturas

Criar no Supabase usando a migration versionada:

```text
supabase/migrations/202605020001_orcaos_subscriptions.sql
```

SQL principal:

```sql
create table if not exists public.orcaos_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  user_id text,
  plan text not null default 'free',
  status text not null default 'inactive',
  current_period_end timestamptz,
  provider text,
  provider_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orcaos_subscriptions_plan_check check (plan in ('free', 'pro')),
  constraint orcaos_subscriptions_status_check check (status in ('active', 'trial', 'past_due', 'canceled', 'inactive'))
);

create index if not exists orcaos_subscriptions_user_id_idx
  on public.orcaos_subscriptions(user_id);
```

Campos aceitos pelo app:

- `plan`: `free` ou `pro`;
- `status`: `active`, `trial`, `past_due`, `canceled` ou `inactive`;
- `current_period_end`: data futura para assinatura com vencimento, ou vazio para liberacao sem vencimento;
- `email`: e-mail cadastrado ou e-mail Google;
- `user_id`: opcional, recomendado como `google:<sub>` quando houver login Google.

## Como Liberar Acesso Pago

Opcao manual direta:

1. Receba pagamento por Pix, link externo ou venda assistida.
2. Crie/atualize uma linha em `orcaos_subscriptions` com `plan = pro` e `status = active`.
3. Cliente cadastra o e-mail em Configuracoes ou vincula a conta Google.
4. Cliente abre Loja / Pro e clica em Verificar assinatura.
5. App passa para Pro.

Opcao por endpoint administrativo:

```bash
curl -X POST https://seu-dominio.com/api/admin/subscriptions \
  -H "Authorization: Bearer $ORCAOS_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@email.com",
    "userId": "google:123456789",
    "plan": "pro",
    "status": "active",
    "currentPeriodEnd": "2026-06-02T00:00:00.000Z",
    "provider": "manual"
  }'
```

Esse endpoint deve ser usado apenas por voce, painel administrativo ou webhook confiavel.

## Proxima Camada

Integrar provedor de pagamento escrevendo na mesma tabela:

- validacao server-side do token Google.
- webhook do provedor escolhido atualizando `orcaos_subscriptions`;
- painel administrativo para ativar, suspender ou renovar assinatura;
- historico de pagamentos/faturas.

O frontend nao precisa mudar se o contrato de resposta continuar:

```json
{
  "plan": "pro",
  "planSource": "subscription",
  "status": "active",
  "expiresAt": null
}
```
