# Aferix — Brand e Publicação

## Assets oficiais
- Header/menu/topbar: `public/icons/aferix-wordmark-premium.svg`
- Documento/PDF: `public/icons/aferix-wordmark-document.svg`
- Launcher/PWA/manifest: `public/icons/aferix-app-icon.svg`
- Splash/Intro: `public/icons/aferix-splash-mark.svg`
- Android adaptive foreground/background: `android/app/src/main/res/drawable/ic_launcher_foreground.xml` e `android/app/src/main/res/drawable/ic_launcher_background.xml`

## Critérios visuais
- Dark premium com fundo preto/grafite profundo.
- Amarelo/dourado como destaque principal.
- Sem texto pequeno no app icon.
- Sem fundo branco no app dark.
- Sem ícone placeholder.
- Sem teal/ciano como identidade principal.
- Verde reservado para sucesso/lucro e vermelho para alerta/erro.

## Uso correto
- O app icon é o monograma para launcher, manifest, favicon e tela de bloqueio local.
- O wordmark premium é a marca horizontal do header, menu e topbar.
- O wordmark document é usado em relatórios, PDFs e documentos claros.
- A intro usa o splash mark premium com copy curta: “Controle seu lucro com clareza.”

## Pendências Android
- Os vetores Android nativos foram alinhados ao dark premium Aferix.
- Os PNGs em `android/app/src/main/res/mipmap-*` existem, mas devem ser revisados visualmente no Android Studio antes do build final de Play Store.
- Antes da publicação final, gerar/validar adaptive icons PNG em todos os buckets se o pipeline nativo exigir rasterização.

## Comandos executados
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run visual:qa`
- `npm run rc:check`
- `npx cap sync android` quando aplicável nesta rodada
