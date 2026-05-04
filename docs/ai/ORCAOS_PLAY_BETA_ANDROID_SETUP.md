# OrçaOS - preparo Android e Beta Fechado Google Play

## Estado atual

O OrçaOS agora possui projeto Android via Capacitor.

- App ID: `br.com.orcaos.app`
- Nome: `OrçaOS`
- Versão inicial Android: `0.1.0-rc.1`
- Version code: `1`
- Web build: `dist`
- Projeto nativo: `android/`

## Comandos do projeto

```bash
source $HOME/.nvm/nvm.sh
npm run rc:check
npm run android:sync
npm run android:build:aab
```

O arquivo final esperado, quando houver Android SDK configurado, fica em:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

## Dependências locais necessárias

Para gerar o `.aab`, a máquina precisa de:

- Node compatível com o projeto via `nvm`;
- Java instalado;
- Android Studio ou Android command line tools;
- Android SDK com `platforms;android-36` e build tools;
- variável `ANDROID_HOME` apontando para o SDK;
- arquivo `android/local.properties` com o caminho do SDK.

Exemplo de `android/local.properties`:

```properties
sdk.dir=/caminho/para/Android/Sdk
```

Esse arquivo não deve ir para o Git.

## Assinatura do app

Para enviar ao Play Console, o `.aab` precisa estar assinado. Crie uma upload key local e copie:

```bash
cp android/keystore.properties.example android/keystore.properties
```

Depois preencha:

```properties
storeFile=../release/orcaos-upload-key.jks
storePassword=senha-real
keyAlias=orcaos-upload
keyPassword=senha-real
```

Não versionar `keystore.properties` nem o arquivo `.jks`.

## Sem aparelho Android físico

Como ainda não há dispositivo Android físico, o fluxo recomendado é:

1. Rodar `npm run rc:check`.
2. Gerar `.aab` assinado.
3. Subir em **Internal testing** no Play Console.
4. Usar o **Pre-launch report** do Google Play para testar em aparelhos reais automatizados.
5. Convidar pelo menos uma pessoa próxima com Android para validar instalação, tela inicial, campos, orçamento, PDF e backup.
6. Só depois abrir **Closed testing** para os 12 testers exigidos em conta nova pessoal.

## Checklist Play Console

- Nome do app: `OrçaOS`
- Categoria: produtividade/negócios/ferramentas profissionais
- Política de privacidade publicada
- Data safety preenchido
- Conteúdo: sem coleta sensível por padrão, app local-first
- Público inicial: teste interno
- Produção: não liberar antes do closed test de 14 dias

## Observação técnica

O app é local-first. Sem backend obrigatório, os dados ficam no armazenamento local do WebView. Por isso, no beta, o usuário deve ser orientado a exportar backup regularmente.
