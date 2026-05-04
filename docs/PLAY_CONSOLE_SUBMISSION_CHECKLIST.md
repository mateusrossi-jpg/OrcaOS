# OrçaOS - Checklist de envio na Play Console

Use este checklist ao criar o app e enviar a versão `0.1.0-rc.1` para teste interno/fechado.

## App

- Nome do app: `OrçaOS`
- Package/application ID: `br.com.orcaos.app`
- Tipo: App
- Categoria sugerida: Produtividade ou Ferramentas
- Distribuição inicial: Teste interno ou teste fechado

## Artefato para upload

```text
android/app/build/outputs/bundle/release/app-release.aab
```

Antes de reenviar outra build:

- aumentar `versionCode` em `android/app/build.gradle`;
- gerar novo AAB com `npm run android:build:aab`.

## Ficha da loja

Base de texto:

```text
docs/legal/PLAY_STORE_LISTING_DRAFT_PT_BR.md
```

Itens para preencher:

- Nome;
- descrição curta;
- descrição completa;
- categoria;
- e-mail de contato;
- screenshots;
- ícone;
- política de privacidade.

## Política e segurança de dados

Usar como base:

```text
docs/legal/PRIVACY_POLICY_DRAFT_PT_BR.md
docs/legal/PLAY_STORE_DATA_SAFETY_DRAFT_PT_BR.md
```

Revisar antes de enviar:

- se há login obrigatório: não;
- se há analytics: não nesta versão;
- se há anúncios: não;
- se há cobrança automática: não;
- se há backend obrigatório: não;
- se há backup em nuvem obrigatório: não;
- se há coleta automática de dados: não planejada na versão local-first.

## Testadores

Preparar lista de e-mails.

Enviar junto:

```text
docs/PLAY_INTERNAL_TEST_RELEASE_NOTES.md
docs/BETA_TESTER_FEEDBACK_FORM.md
docs/BETA_TESTER_INVITE_MESSAGE.md
```

Mensagem curta sugerida:

```text
Olá! Esta é a versão beta fechada do OrçaOS.
Teste principalmente: Home, atendimento guiado, levantamento, cálculos, orçamento, aprovação, relatório e backup.
Se algo travar, ficar confuso ou parecer pouco útil em campo, me avise com o máximo de detalhe possível.
```

## Pre-launch report

Depois do upload, conferir:

- crashes;
- ANRs;
- problemas de tela branca;
- incompatibilidade de SDK;
- problemas de acessibilidade;
- screenshots automáticos;
- avisos de segurança.

## Critério para liberar mais testadores

- AAB aceito pela Play Console;
- app abre no Pre-launch report;
- APK testado em pelo menos um Android real;
- fluxo principal passa sem travamento;
- feedback inicial não aponta confusão grave na Home ou no orçamento.
