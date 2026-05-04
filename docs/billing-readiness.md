# OrçaOS Billing Readiness

Este documento organiza o caminho de cobrança para depois do beta. O beta fechado continua sem cobrança automática; a liberação Pro pode ser assistida/local ou validada por backend quando o canal real estiver pronto.

## Canais

- `beta-assisted`: padrão do beta. Não promete venda automática.
- `external-checkout`: checkout externo com webhook/backend liberando Pro.
- `google-play`: preparação para Google Play Billing, com compra nativa e validação segura no backend.

## Variáveis de ambiente

- `VITE_ORCAOS_BILLING_CHANNEL`: `beta-assisted`, `external-checkout` ou `google-play`.
- `VITE_ORCAOS_PRO_CHECKOUT_URL`: link público do checkout externo.
- `VITE_ORCAOS_PRO_MANAGE_URL`: portal para gerenciar assinatura.
- `VITE_ORCAOS_ENTITLEMENTS_ENDPOINT`: endpoint seguro que confirma se a conta tem Pro.
- `VITE_ORCAOS_ANDROID_PACKAGE_NAME`: package name do app Android.
- `VITE_ORCAOS_PLAY_PRO_PRODUCT_ID`: id do produto/assinatura Pro no Play Console.

## Regra de segurança

O front-end nunca deve liberar Pro apenas por clique em botão ou por comprovante visual. A liberação comercial precisa vir do endpoint de entitlement. Chaves sensíveis, webhook, validação de compra e consulta ao Google Play Developer API ficam fora do front-end.

## Para sair do beta

1. Definir preço e periodicidade do Pro.
2. Criar produto/assinatura no Google Play Console ou checkout externo.
3. Implementar backend de entitlement.
4. Validar compra no backend.
5. Liberar Pro somente pela resposta validada do backend.
6. Remover qualquer ferramenta de Pro local fora de ambiente de desenvolvimento.
