# OrcaOS External Monetization Setup V1

Data: 2026-05-02

## Objetivo

Checklist operacional para deixar conta, Google OAuth, Supabase e liberacao Pro prontos para monetizacao imediata no lancamento.

## 1. Supabase

Criar um projeto Supabase e executar a migration versionada:

```sql
supabase/migrations/202605020001_orcaos_subscriptions.sql
```

Se for executar manualmente pelo painel, abrir SQL Editor, colar o conteudo da migration e rodar uma vez.

Variaveis no deploy:

```bash
ORCAOS_SUPABASE_URL=https://seu-projeto.supabase.co
ORCAOS_SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
ORCAOS_ADMIN_API_KEY=uma_chave_admin_forte
```

Importante:

- `ORCAOS_SUPABASE_SERVICE_ROLE_KEY` fica apenas no backend.
- Nunca criar `VITE_ORCAOS_SUPABASE_SERVICE_ROLE_KEY`.
- RLS fica habilitado na tabela; o endpoint usa service role server-side.

## 2. Google OAuth

No Google Cloud Console:

1. Criar ou selecionar projeto.
2. Configurar OAuth consent screen.
3. Criar credencial `OAuth client ID`.
4. Tipo: Web application.
5. Authorized JavaScript origins:
   - `http://localhost:5173`
   - dominio de producao, por exemplo `https://orcaos.com.br`
6. Scopes usados pelo app:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/drive.appdata`

Variavel no frontend:

```bash
VITE_GOOGLE_CLIENT_ID=seu_client_id_google.apps.googleusercontent.com
```

Para lancamento publico, revisar tela de consentimento, politica de privacidade e justificativa do escopo Drive `appdata`.

## 3. Endpoint De Assinatura

Variaveis no frontend:

```bash
VITE_ORCAOS_ENTITLEMENTS_ENDPOINT=/api/entitlements
VITE_ORCAOS_ENTITLEMENTS_API_KEY=
```

Variaveis no backend:

```bash
ORCAOS_ALLOWED_ORIGIN=https://seu-dominio.com
ORCAOS_ENTITLEMENTS_API_KEY=
ORCAOS_PRO_USERS=
```

`ORCAOS_ENTITLEMENTS_API_KEY` e opcional. Se for usada, colocar o mesmo valor em `VITE_ORCAOS_ENTITLEMENTS_API_KEY`, sabendo que chave `VITE_` fica exposta no navegador. Ela serve apenas como barreira simples, nao como segredo comercial forte.

## 4. Liberar Primeiro Cliente Pro

Opcao recomendada para venda assistida:

```bash
curl -X POST https://seu-dominio.com/api/admin/subscriptions \
  -H "Authorization: Bearer SUA_ORCAOS_ADMIN_API_KEY" \
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

Se ainda nao houver `userId` Google, liberar apenas pelo e-mail:

```json
{
  "email": "cliente@email.com",
  "plan": "pro",
  "status": "active",
  "provider": "manual"
}
```

Depois o cliente deve usar o mesmo e-mail no cadastro ou vincular Google em Configuracoes.

## 5. Teste De Verificacao Pro

```bash
curl -X POST https://seu-dominio.com/api/entitlements \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@email.com",
    "userId": "google:123456789"
  }'
```

Resposta esperada:

```json
{
  "plan": "pro",
  "planSource": "subscription",
  "status": "active",
  "expiresAt": "2026-06-02T00:00:00.000Z"
}
```

## 6. Confirmacao No App

1. Abrir Configuracoes.
2. Cadastrar o e-mail do cliente ou vincular Google.
3. Abrir Loja / Pro.
4. Clicar em verificar assinatura.
5. Confirmar que calculos Pro abrem sem bloqueio.

## 7. Provedor De Pagamento

Para monetizacao imediata, o fluxo manual ja funciona com Pix/link externo. A integracao completa deve escrever na mesma tabela `orcaos_subscriptions`.

Proximos endpoints recomendados:

- webhook do provedor escolhido;
- validacao server-side de evento;
- registro de pagamento/fatura;
- renovacao automatica de `current_period_end`;
- cancelamento mudando `status` para `canceled` ou `inactive`.
