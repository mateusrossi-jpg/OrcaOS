# OrçaOS - Teste em Android real

Use este roteiro para validar o APK debug em um aparelho físico antes de chamar testadores externos.

## Pré-requisitos

- Ativar modo desenvolvedor no Android.
- Ativar depuração USB.
- Conectar o aparelho via USB.
- Ter `adb` disponível no terminal.

Verificar conexão:

```bash
adb devices
```

O aparelho deve aparecer como `device`. Se aparecer `unauthorized`, aceite a autorização no celular.

## Instalar APK debug

Artefato:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Instalar:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Se precisar limpar dados antes do teste:

```bash
adb shell pm clear br.com.orcaos.app
```

## Abrir app

```bash
adb shell monkey -p br.com.orcaos.app 1
```

## Capturar logs simples

Limpar logs antes do teste:

```bash
adb logcat -c
```

Capturar logs enquanto testa:

```bash
adb logcat | grep -i "orcaos\|capacitor\|chromium\|crash\|fatal"
```

Se houver travamento, salve o trecho com horário, tela e ação feita.

## Checklist visual rápido

1. O ícone aparece correto no launcher.
2. A splash nativa não mostra fundo branco.
3. A intro aparece só na primeira abertura.
4. Ao voltar do segundo plano, o app preserva a tela.
5. A Home cabe bem na tela do aparelho.
6. A navegação inferior não corta texto.
7. Botões principais são fáceis de tocar.
8. Campos de formulário não ficam escondidos pelo teclado.
9. Orçamento copiado/compartilhado tem texto legível.
10. Backup local é fácil de encontrar.

## Checklist funcional mínimo

1. Criar cliente.
2. Criar atendimento.
3. Registrar levantamento.
4. Usar cálculo vinculado.
5. Gerar orçamento.
6. Marcar enviado.
7. Marcar aprovado.
8. Converter em OS.
9. Fechar e reabrir app.
10. Confirmar persistência.

## Remover app

```bash
adb uninstall br.com.orcaos.app
```

