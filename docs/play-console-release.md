# OrçaOS - Android e Play Console

Este guia prepara o OrçaOS para gerar APK debug e AAB release no futuro, sem versionar chaves, senhas ou arquivos locais sensíveis.

## Estado do projeto

- App Android via Capacitor: `android/`
- Package/application ID: `br.com.orcaos.app`
- Nome do app: `OrçaOS`
- Web build: `dist/`
- Comando release esperado: `cd android && ./gradlew bundleRelease`
- Comando debug esperado: `cd android && ./gradlew assembleDebug`

## 1. Instalar Android Studio/SDK no Ubuntu

Opção recomendada:

1. Instale o Android Studio pelo site oficial ou pela loja de aplicativos da distribuição.
2. Abra o Android Studio.
3. Vá em `More Actions` -> `SDK Manager`.
4. Instale:
   - Android SDK Platform 36;
   - Android SDK Build-Tools;
   - Android SDK Platform-Tools;
   - Android SDK Command-line Tools.

Depois configure variáveis no shell, ajustando o caminho se necessário:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

Para persistir, coloque essas linhas no `~/.bashrc` ou `~/.zshrc`.

## 2. Configurar SDK no projeto

Crie o arquivo local:

```bash
cp android/local.properties.example android/local.properties
```

Edite `android/local.properties`:

```properties
sdk.dir=/home/mateus/Android/Sdk
```

Esse arquivo é local e não deve ir para o Git.

## 3. Abrir no Android Studio

Abra a pasta:

```text
android/
```

Não abra a raiz inteira do projeto como projeto Android. A raiz continua sendo o projeto web/Vite; a pasta `android/` é o projeto nativo.

## 4. Criar upload key/keystore

Crie uma pasta local para a chave:

```bash
mkdir -p release
```

Gere a upload key:

```bash
keytool -genkeypair \
  -v \
  -keystore release/orcaos-upload-key.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias orcaos-upload
```

Guarde a senha em local seguro. Não coloque a senha nem o `.jks` no Git.

## 5. Configurar assinatura release

Crie o arquivo local:

```bash
cp android/keystore.properties.example android/keystore.properties
```

Preencha:

```properties
storeFile=../release/orcaos-upload-key.jks
storePassword=SENHA_REAL
keyAlias=orcaos-upload
keyPassword=SENHA_REAL
```

Arquivos ignorados pelo Git:

- `android/keystore.properties`
- `android/key.properties`
- `*.jks`
- `*.keystore`
- `release/*.jks`
- `release/*.keystore`
- `android/local.properties`
- `android/app/release/`
- `android/app/build/outputs/`

## 6. Gerar APK debug

Na raiz do projeto:

```bash
source $HOME/.nvm/nvm.sh
npm run android:build:apk:debug
```

Ou manualmente:

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

Saída esperada:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## 7. Gerar AAB release

Na raiz do projeto:

```bash
source $HOME/.nvm/nvm.sh
npm run android:build:aab
```

Ou manualmente:

```bash
npm run build
npx cap sync android
cd android
./gradlew bundleRelease
```

Saída esperada:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

Se `android/keystore.properties` não existir, o build release deve falhar com aviso para configurar assinatura.

## 8. Aumentar versionCode e versionName

Edite:

```text
android/app/build.gradle
```

Campos:

```gradle
versionCode 1
versionName "0.1.0-rc.1"
```

Regra prática:

- `versionCode`: sempre aumentar a cada envio para Play Console.
- `versionName`: texto visível da versão, por exemplo `0.1.0-rc.2`.

## 9. Enviar para teste interno no Play Console

1. Acesse o Play Console.
2. Crie o app `OrçaOS`.
3. Preencha ficha da loja, categoria, e-mail de contato e política de privacidade.
4. Preencha `Data safety`.
5. Vá em `Testing` -> `Internal testing`.
6. Crie uma release.
7. Faça upload de:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

8. Adicione testers por lista de e-mails.
9. Publique a release de teste interno.
10. Use o Pre-launch report do Google Play para validar em aparelhos Android reais do Google.

## 10. Sem aparelho Android físico

Sem dispositivo físico, use esta ordem:

1. Validar `npm run rc:check`.
2. Gerar APK debug quando SDK estiver configurado.
3. Gerar AAB release assinado.
4. Subir para teste interno.
5. Aguardar Pre-launch report.
6. Chamar pelo menos uma pessoa com Android para teste real.
7. Depois iniciar Closed testing com 12 testers por 14 dias, caso a conta pessoal nova exija.
