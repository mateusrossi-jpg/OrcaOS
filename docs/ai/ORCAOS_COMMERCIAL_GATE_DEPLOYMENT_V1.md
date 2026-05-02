# OrcaOS Commercial Gate Deployment V1

Data: 2026-05-02

## Objetivo

Esta etapa fecha o fluxo comercial minimo antes do pagamento integrado:

1. usuario entra com Google;
2. app chama `VITE_ORCAOS_ENTITLEMENTS_ENDPOINT`;
3. endpoint confere se o email ou `userId` esta na allowlist Pro;
4. app atualiza `accountPlanStorage`;
5. gate central libera ou bloqueia calculos Pro.

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
```

`ORCAOS_PRO_USERS` aceita emails e IDs Google salvos como `google:<sub>`.

## Como Vender No Beta

1. Receba pagamento manualmente ou por link externo.
2. Adicione o email Google do cliente em `ORCAOS_PRO_USERS`.
3. Redeploy/restart do endpoint, se a plataforma exigir.
4. Cliente entra com Google em Configuracoes.
5. Cliente abre Loja / Pro e clica em Verificar assinatura.
6. App passa para Pro.

## Proxima Camada

Substituir a allowlist por backend real com:

- provedor de pagamento;
- webhook de pagamento;
- tabela de assinaturas;
- endpoint `/api/entitlements` lendo assinatura ativa;
- validacao server-side do token Google.

O frontend nao precisa mudar se o contrato de resposta continuar:

```json
{
  "plan": "pro",
  "planSource": "subscription",
  "status": "active",
  "expiresAt": null
}
```
