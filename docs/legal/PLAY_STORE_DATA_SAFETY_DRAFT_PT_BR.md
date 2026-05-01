# OrçaOS — Rascunho de Segurança de Dados para Play Store

Versão preliminar para preenchimento e revisão antes da publicação.

Última atualização: 30 de abril de 2026

---

## 1. Objetivo

Este documento ajuda a preparar as respostas do formulário de Segurança de Dados da Play Store para a versão inicial do OrçaOS.

A versão inicial planejada é local-first e deve evitar coleta automática de dados sempre que possível.

---

## 2. Princípio da versão MVP

Para o MVP, a diretriz é:

```txt
coletar o mínimo possível
armazenar localmente
não compartilhar dados automaticamente
não adicionar analytics/anúncios/login/nuvem antes da política estar revisada
```

---

## 3. Dados inseridos pelo usuário

O usuário pode inserir dados como:

- nome profissional;
- dados de clientes;
- descrições de serviços;
- valores de orçamento;
- cálculos técnicos;
- relatórios;
- observações de OS;
- itens de levantamento.

Na proposta local-first, esses dados ficam no dispositivo do usuário, salvo quando ele decidir exportar, compartilhar ou enviar.

---

## 4. Coleta automática planejada para MVP

Para a versão inicial, a recomendação é não adicionar:

- analytics;
- anúncios;
- login externo;
- rastreamento;
- SDKs de terceiros;
- sincronização em nuvem;
- crash reporting externo sem revisão prévia.

Se algum desses recursos for adicionado, este documento e a política de privacidade devem ser revisados.

---

## 5. Compartilhamento

O app não deve compartilhar automaticamente dados com terceiros na versão local-first.

O compartilhamento acontece apenas quando o usuário decide enviar uma proposta, relatório, mensagem, PDF ou arquivo para outra pessoa.

---

## 6. Possíveis respostas iniciais para revisão

Estas respostas são um rascunho e devem ser conferidas no console da Play Store no momento da publicação.

### O app coleta ou compartilha dados do usuário?

Resposta pretendida para MVP local-first:

```txt
O app não coleta nem compartilha dados automaticamente com terceiros.
```

Atenção: se houver analytics, crash reporting, anúncios, login, pagamento, nuvem ou SDK externo, a resposta pode mudar.

### Os dados são criptografados em trânsito?

Para MVP sem envio automático:

```txt
Não aplicável para dados mantidos localmente.
```

Se houver envio por rede, API ou nuvem, será necessário usar HTTPS e declarar adequadamente.

### O usuário pode solicitar exclusão de dados?

Para dados locais:

```txt
O usuário pode apagar dados no próprio dispositivo/app quando a função estiver disponível ou limpar os dados locais do aplicativo/navegador.
```

Antes da publicação, idealmente implementar ou documentar um caminho simples de exclusão local.

---

## 7. Riscos antes da publicação

Antes de publicar, verificar:

- se o app usa algum SDK externo;
- se algum dado é enviado para servidor;
- se existe login;
- se existe backup em nuvem;
- se existe anúncio;
- se existe pagamento/assinatura;
- se existe coleta de erro/crash externa;
- se existe permissão sensível no Android.

Qualquer resposta positiva exige atualização da política de privacidade e do formulário de segurança.

---

## 8. Recomendação para o MVP

Para facilitar a primeira publicação:

1. manter o app sem analytics e sem anúncios inicialmente;
2. validar uso local-first;
3. publicar com política clara;
4. só depois adicionar monetização/assinatura com revisão adequada;
5. documentar cada nova coleta antes de publicar atualização.

---

## 9. Status

```txt
Documento: rascunho
Uso: preparação interna
Pronto para envio oficial: não
Revisão necessária antes da Play Store: sim
```
