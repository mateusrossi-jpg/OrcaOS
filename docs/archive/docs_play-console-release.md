# Aferix - Android e Play Console

Este guia prepara o Aferix para gerar APK debug e AAB release no futuro, sem versionar chaves, senhas ou arquivos locais sensíveis.

## Estado do projeto

- App Android via Capacitor: `android/`
- Package/application ID: `br.com.aferix.app`
- Nome do app: `Aferix`
- Web build: `dist/`
- Comando release esperado: `cd android && ./gradlew bundleRelease`
- Comando debug esperado: `cd android && ./gradlew assembleDebug`

## 1. Instalar Android Studio/SDK no Ubuntu

Opção recomendada:

1. Instale o Android Studio pelo site oficial ou pela loja de aplicativos da distribuição.
2. Instale um JDK 21 completo, não apenas o runtime. O build Android do Capacitor 8 usa `sourceCompatibility JavaVersion.VERSION_21` e precisa de `javac`.
3. Abra o Android Studio.
4. Vá em `More Actions` -> `SDK Manager`.
5. Instale:
   - Android SDK Platform 36;
   - Android SDK Build-Tools;
   - Android SDK Platform-Tools;
   - Android SDK Command-line Tools.

Depois configure variáveis no shell, ajustando os caminhos se necessário:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export JAVA_HOME="/usr/lib/jvm/java-21-openjdk-amd64"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

Para persistir, coloque essas linhas no `~/.bashrc` ou `~/.zshrc`.

Verificação rápida:

```bash
java -version
javac -version
```

Ambos devem apontar para Java 21. Se `java` for 21 mas `javac` não existir, instale o pacote JDK completo antes de gerar APK/AAB.

## 2. Configurar SDK no projeto

Crie o arquivo local:

```bash
cp android/local.properties.example android/local.properties
```

Edite `android/local.properties`:

```properties
sdk.dir=/caminho/para/Android/Sdk
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
  -keystore release/aferix-upload-key.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias aferix-upload
```

Guarde a senha em local seguro. Não coloque a senha nem o `.jks` no Git.

## 5. Configurar assinatura release

Crie o arquivo local:

```bash
cp android/keystore.properties.example android/keystore.properties
```

Preencha:

```properties
storeFile=../release/aferix-upload-key.jks
storePassword=SENHA_REAL
keyAlias=aferix-upload
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
2. Crie o app `Aferix`.
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
