# Aferix - Fechamento do beta fechado

Este documento concentra o estado final para iniciar teste interno/fechado sem precisar procurar caminhos em vários arquivos.

## Estado técnico

- App web validado com `npm run build`.
- Release candidate validado com `npm run rc:check`.
- APK debug gerado para teste local em aparelho Android.
- AAB release assinado gerado para Play Console.
- Android via Capacitor com package `br.com.aferix.app`.
- Nome visível do app: `Aferix`.
- Versão atual: `0.1.0-rc.1`.
- `versionCode`: `1`.
- `minSdk`: `24`.
- `targetSdk`: `36`.

## Artefatos atuais

```text
android/app/build/outputs/apk/debug/app-debug.apk
android/app/build/outputs/bundle/release/app-release.aab
```

Uso:

- `app-debug.apk`: instalar manualmente em celular Android para teste rápido.
- `app-release.aab`: enviar para teste interno/fechado na Play Console.

Roteiro de instalação e teste em aparelho real:

```text
docs/ANDROID_REAL_DEVICE_TEST.md
```

## Roteiro manual mínimo no celular

1. Instalar o APK debug.
2. Abrir pela primeira vez e conferir splash nativa + intro curta.
3. Confirmar que aberturas seguintes entram direto no app.
4. Na Home, conferir as quatro ações principais:
   - Novo atendimento guiado;
   - Orçamento manual rápido;
   - Cálculo avulso;
   - Continuar atendimento.
5. Criar um cliente simples.
6. Criar um atendimento em orçamento.
7. Abrir levantamento e registrar:
   - ambiente;
   - serviço;
   - material;
   - medição;
   - observação.
8. Usar um cálculo essencial e vincular ao atendimento ou orçamento.
9. Gerar orçamento.
10. Copiar ou compartilhar texto do orçamento.
11. Marcar orçamento como enviado.
12. Marcar orçamento como aprovado.
13. Confirmar que `Converter em OS` só aparece depois da aprovação.
14. Abrir catálogo e cadastrar um material simples.
15. Abrir lista de compra do cliente, se houver item de material.
16. Abrir financeiro simples e conferir lucro gerencial.
17. Abrir relatório e conferir cliente, atendimento, observações e cálculos.
18. Fazer backup local.
19. Fechar o app, abrir de novo e conferir persistência local.

## Critérios para chamar testadores

- Fluxo acima passa em pelo menos um aparelho Android real.
- Nenhum texto crítico chama atendimento de OS antes da aprovação.
- Nenhum fluxo básico exige login.
- Loja/Pro aparece como validação assistida, sem cobrança automática.
- Backup local está visível em `Mais`/`Configurações`.
- App não fica com tela branca após fechar e reabrir.
- AAB release sobe no teste interno da Play Console.

## Play Console

Preencher antes de publicar teste:

- Nome do app: `Aferix`.
- Categoria sugerida: Produtividade ou Ferramentas.
- E-mail de suporte.
- Política de privacidade revisada.
- Segurança de dados revisada.
- Ficha da loja em `docs/legal/PLAY_STORE_LISTING_DRAFT_PT_BR.md`.
- Data Safety em `docs/legal/PLAY_STORE_DATA_SAFETY_DRAFT_PT_BR.md`.
- Política em `docs/legal/PRIVACY_POLICY_DRAFT_PT_BR.md`.

## Próxima versão

Antes de enviar uma nova build para a Play Console:

1. Aumentar `versionCode` em `android/app/build.gradle`.
2. Atualizar `versionName`, se necessário.
3. Rodar:

```bash
npm run build
npm run rc:check
npm run android:build:aab
```
