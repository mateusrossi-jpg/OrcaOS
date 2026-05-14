# Aferix - Handoff da versão 0.1.0-rc.1

Este é o fechamento operacional da versão `0.1.0-rc.1` para beta interno/fechado.

## Status

Pronto para teste interno em Android real e envio do AAB para trilha de teste da Play Console.

## Entregue nesta rodada

- Home reorganizada como central de decisão.
- Navegação principal simplificada.
- Linguagem ajustada para atendimento antes de OS.
- Atendimento guiado com cliente, atendimento, levantamento, cálculos, revisão e orçamento.
- Levantamento com ambientes, serviços, materiais, medições, observações e revisão.
- Orçamento manual rápido e orçamento vinculado ao atendimento.
- Aprovação antes de conversão em OS.
- Cálculos essenciais com explicações, exemplos e avisos técnicos.
- Catálogo local, modelos de serviço, biblioteca de materiais e lista de compra do cliente.
- Estrutura de busca online por providers, sem scraping frágil como dependência.
- Financeiro simples gerencial com lucro estimado.
- Relatórios técnicos e painel gerencial leve.
- Loja/Pro como validação assistida, sem cobrança automática.
- Backup local visível.
- Ícone Android adaptativo, splash nativa e intro curta de primeira abertura.
- Documentos de Play Store, política, data safety, beta, release notes e feedback.
- APK debug gerado.
- AAB release assinado gerado.

## Artefatos

```text
APK debug:
android/app/build/outputs/apk/debug/app-debug.apk

AAB release:
android/app/build/outputs/bundle/release/app-release.aab
```

## Validações já realizadas

- `npm run build`: passou.
- `npm run rc:check`: passou anteriormente com:
  - Typecheck ok;
  - 28 arquivos de teste;
  - 174 testes;
  - build ok.
- `npm run android:build:apk:debug`: passou.
- `npm run android:build:aab`: passou.
- APK conferido com `aapt`:
  - package `br.com.aferix.app`;
  - `versionCode` 1;
  - `versionName` `0.1.0-rc.1`;
  - `minSdk` 24;
  - `targetSdk` 36;
  - label `Aferix`.

## Documentos úteis

```text
docs/BETA_FECHADO_FECHAMENTO.md
docs/PLAY_INTERNAL_TEST_RELEASE_NOTES.md
docs/BETA_TESTER_FEEDBACK_FORM.md
docs/BETA_TESTER_INVITE_MESSAGE.md
docs/PLAY_CONSOLE_SUBMISSION_CHECKLIST.md
docs/ANDROID_REAL_DEVICE_TEST.md
docs/play-console-release.md
docs/legal/PLAY_STORE_LISTING_DRAFT_PT_BR.md
docs/legal/PLAY_STORE_DATA_SAFETY_DRAFT_PT_BR.md
docs/legal/PRIVACY_POLICY_DRAFT_PT_BR.md
```

## Checklist antes de chamar testadores externos

1. Instalar o APK debug em pelo menos um Android real.
2. Abrir o app pela primeira vez e validar splash + intro curta.
3. Fechar e abrir novamente, confirmando que a intro não repete.
4. Executar o roteiro de `docs/BETA_FECHADO_FECHAMENTO.md`.
5. Subir o AAB na Play Console em teste interno.
6. Conferir se a Play Console aceita o AAB.
7. Preencher ficha, data safety e política com base nos rascunhos em `docs/legal`.
8. Chamar poucos testadores e coletar feedback com `docs/BETA_TESTER_FEEDBACK_FORM.md`.

## Riscos assumidos para beta

- O app ainda precisa de teste visual/manual em aparelho real.
- Financeiro é gerencial e não fiscal.
- Busca online de materiais é auxiliar/futura; fluxo principal continua local/manual.
- Pro não tem cobrança automática nesta versão.
- Sem backend obrigatório; dados são local-first e dependem de backup/exportação.
- Screenshots finais da Play Store ainda devem ser feitos em tela real.

## Próxima versão

Antes de gerar nova build para Play Console:

1. Incrementar `versionCode` em `android/app/build.gradle`.
2. Atualizar `versionName`, se necessário.
3. Gerar novo AAB:

```bash
npm run build
npm run rc:check
npm run android:build:aab
```
