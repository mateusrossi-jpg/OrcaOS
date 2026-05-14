# Aferix Commercial Gate Deployment V1

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

## Politica Comercial

- O Free continua funcional e sem marca d'agua agressiva.
- A venda real usa checkout externo configuravel e verificacao server-side.
- O app nao recebe chave secreta, nao processa cartao e nao libera Pro sozinho.
- A verificacao Pro depende da conta/e-mail usado no app. O cliente deve cadastrar o mesmo e-mail liberado no backend ou vincular a conta Google correspondente.
- `active` e `trial` liberam Pro.
- `expired`, `inactive` e `past_due` mantem o usuario no Free e exibem mensagem clara na Loja / Pro.
- Cloud, busca online pesada, fiscal e multiusuario continuam fora da obrigacao da V1.

## Variaveis Do Frontend

```bash
VITE_GOOGLE_CLIENT_ID=seu_client_id_google
VITE_ORCAOS_ENTITLEMENTS_ENDPOINT=/api/entitlements
VITE_ORCAOS_ENTITLEMENTS_API_KEY=
VITE_ORCAOS_PRO_CHECKOUT_URL=https://seu-checkout.com/orcaos-pro
VITE_ORCAOS_PRO_MANAGE_URL=https://seu-portal.com/assinatura
```

`VITE_ORCAOS_ENTITLEMENTS_API_KEY` e opcional e fica exposta no frontend. Use apenas como barreira simples no beta fechado, nao como segredo forte.
`VITE_ORCAOS_PRO_CHECKOUT_URL` e `VITE_ORCAOS_PRO_MANAGE_URL` devem ser links publicos. Nunca coloque segredo, token privado ou service role em variaveis `VITE_`.

## Variaveis Do Endpoint

```bash
ORCAOS_ALLOWED_ORIGIN=https://seu-dominio.com
ORCAOS_ENTITLEMENTS_API_KEY=
ORCAOS_PRO_USERS=cliente@email.com,google:123456789
ORCAOS_SUPABASE_URL=https://seu-projeto.supabase.co
ORCAOS_SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
ORCAOS_ADMIN_API_KEY=uma_chave_admin_forte
ORCAOS_WEBHOOK_API_KEY=uma_chave_webhook_forte
```

`ORCAOS_PRO_USERS` aceita e-mails cadastrados, e-mails Google e IDs Google salvos como `google:<sub>`.
`ORCAOS_SUPABASE_SERVICE_ROLE_KEY` e `ORCAOS_ADMIN_API_KEY` nunca devem usar prefixo `VITE_` e nunca devem ir para o frontend.
`ORCAOS_WEBHOOK_API_KEY` tambem fica apenas no backend e deve ser enviado pelo provedor/automacao no header `Authorization: Bearer`.
`ORCAOS_ALLOWED_ORIGIN` deve apontar para o dominio real em producao; nao deixe `*` em ambiente publico.

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

## Fluxo De Venda Real

1. Usuario abre Loja / Pro.
2. App abre `VITE_ORCAOS_PRO_CHECKOUT_URL` com parametros `email`, `userId` e `source=orcaos-app`.
3. Cliente paga no provedor escolhido.
4. Provedor ou automacao chama `POST /api/webhooks/subscription`.
5. Webhook grava/atualiza `orcaos_subscriptions`.
6. Usuario volta ao app e clica em `Verificar assinatura`.
7. App chama `VITE_ORCAOS_ENTITLEMENTS_ENDPOINT` e libera Pro se a assinatura estiver ativa.

### Webhook Generico

Endpoint:

```text
POST /api/webhooks/subscription
Authorization: Bearer $ORCAOS_WEBHOOK_API_KEY
Content-Type: application/json
```

Payload minimo:

```json
{
  "event": "payment.approved",
  "email": "cliente@email.com",
  "userId": "email:cliente@email.com",
  "currentPeriodEnd": "2026-06-03T00:00:00.000Z",
  "provider": "checkout",
  "providerCustomerId": "cus_123"
}
```

Eventos aceitos como Pro ativo:

- `paid`
- `approved`
- `active`
- `subscription.active`
- `payment.approved`

Eventos aceitos como pendencia/cancelamento:

- `past_due`
- `subscription.past_due`
- `canceled`
- `subscription.canceled`
- `refunded`
- `chargeback`

## Como Liberar Acesso Pago Manualmente

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

## Seguranca Operacional

- A service role do Supabase fica somente no backend/API.
- Nunca crie variavel `VITE_` com service role, chave admin ou segredo de webhook.
- `ORCAOS_ADMIN_API_KEY` e obrigatorio para liberar assinatura pelo endpoint administrativo.
- O frontend nunca deve liberar Pro por conta propria quando o endpoint responde erro, `inactive`, `expired` ou `past_due`.
- As ferramentas locais de teste ficam atras de `VITE_ORCAOS_DEV_TOOLS=true` e devem ficar desligadas no beta comercial.

## Proxima Camada

Integrar provedor de pagamento escrevendo na mesma tabela:

- validacao server-side do token Google.
- adaptador especifico do provedor escolhido, se ele exigir assinatura HMAC ou formato proprio;
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
