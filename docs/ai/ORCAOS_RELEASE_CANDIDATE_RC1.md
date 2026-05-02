# OrcaOS Release Candidate RC1

Data: 2026-05-02
Versao: 0.1.0-rc.1

## Objetivo

Este release candidate serve para validar se o OrcaOS esta pronto para um beta fechado com uso real controlado. O foco nao e adicionar novas funcoes, e sim confirmar confianca nos fluxos principais, nos calculos criticos, na persistencia local e na geracao de proposta/relatorio.

## Escopo Do RC1

- Tema visual consolidado em `src/styles/global.css` e `src/styles/orcaosMvpTheme.css`.
- Remocao das antigas camadas CSS nao importadas.
- Fluxo principal validavel: Atendimentos -> Calculos/Levantamento -> Orcamento -> Relatorio.
- Bloqueio comercial minimo com cadastro por e-mail, vinculo Google, conta local, gate Pro e endpoint `/api/entitlements` por allowlist.
- Documentos e previews mantidos com fundo branco quando representam papel/PDF.
- App local-first, com backup local disponivel em Configuracoes.

## Como Validar

Comandos obrigatorios antes de considerar o RC aprovado:

```bash
npm run rc:check
```

Comandos equivalentes:

```bash
npm run typecheck
npm test
npm run build
```

Para teste manual:

```bash
npm run dev
```

## Checklist De Fluxo Principal

- Criar um cliente novo.
- Criar uma OS para esse cliente.
- Confirmar que a OS aparece como contexto ativo.
- Abrir Calculos e executar pelo menos:
  - Corrente por potencia.
  - Lei de Ohm.
  - Um calculo hidraulico simples.
  - Um calculo financeiro/preco.
- Enviar pelo menos um resultado para Levantamento.
- Em Levantamento:
  - Criar ou selecionar um ambiente.
  - Adicionar servico de mao de obra guiada.
  - Adicionar material/peca.
  - Adicionar observacao tecnica.
  - Revisar itens salvos.
- Enviar itens para Orcamento.
- Em Orcamento:
  - Editar quantidade e valor.
  - Conferir totais.
  - Abrir preview da proposta.
  - Salvar/imprimir PDF pelo navegador.
- Em Relatorios:
  - Confirmar que os itens tecnicos aparecem.
  - Confirmar texto de observacao e detalhes.
  - Salvar/imprimir PDF pelo navegador.
- Fechar e reabrir o app.
- Confirmar que cliente, OS, itens e configuracoes persistiram localmente.
- Exportar backup local em Configuracoes.

## Calculos Criticos Para Conferencia Manual

### Lei De Ohm

Casos esperados:

- V = 220 V, R = 22 ohm -> I = 10 A.
- V = 220 V, I = 10 A -> R = 22 ohm.
- I = 10 A, R = 22 ohm -> V = 220 V.

### Potencia E Corrente

Casos esperados:

- P = 2200 W, V = 220 V, FP = 1, monofasico/bifasico simplificado -> I = 10 A.
- V = 220 V, I = 10 A, FP = 1, monofasico/bifasico simplificado -> P = 2200 W.

### Hidraulica Basica

- Reservatorio retangular: conferir se dimensoes em metros geram volume em m3 e litros coerentes.
- Vazao: conferir L/min, L/h e m3/h.
- Pressao por coluna: 10 mca deve ficar aproximadamente 0,98 bar.

### Financeiro

- Margem deve ser tratada como margem sobre preco de venda, nao simples acrescimo sobre custo.
- Markup deve ficar separado de margem.
- Desconto maximo nao pode sugerir preco abaixo do minimo definido.

## Criterios De Aprovacao

O RC1 pode ser considerado aprovado para beta fechado se:

- `npm run rc:check` passar limpo.
- Nenhum fluxo principal travar.
- Nao houver tela comum com blocos brancos ou azuis fora de documentos.
- Lei de Ohm e calculos basicos baterem com os casos esperados.
- Dados locais persistirem depois de fechar/reabrir.
- Backup local exportar sem erro.
- Proposta e relatorio puderem ser salvos como PDF pelo navegador.

## Riscos Conhecidos

- Login Google esta preparado no frontend quando `VITE_GOOGLE_CLIENT_ID` estiver configurado; a verificacao de assinatura pode consultar `/api/entitlements` por allowlist Pro.
- Backup Google Drive manual esta preparado quando `VITE_GOOGLE_CLIENT_ID` estiver configurado; backup automatico ainda nao esta implementado.
- O app segue local-first; perda de dados pode ocorrer se o navegador limpar armazenamento local e o usuario nao tiver backup exportado.
- Calculos tecnicos sao estimativas de apoio e precisam de validacao profissional em campo.
- Publicacao comercial exige politica de privacidade e termos/avisos tecnicos claros.

## Fora Do RC1

- Backend de login social.
- Sincronizacao em nuvem.
- Pagamento Pro integrado por webhook.
- ERP completo.
- Catalogo online automatizado por fornecedores reais.

## Monetizacao Dos Calculos

A matriz Free/Pro dos calculos do RC1 esta documentada em `docs/ai/ORCAOS_CALCULATION_MONETIZATION_MATRIX_RC1.md`.
No RC1, a separacao aparece na organizacao, nos badges e no bloqueio de abertura dos calculos Pro. A conta/plano fica em `accountPlanStorage`, pode cadastrar e-mail proprio, simular Pro pela tela Loja / Pro, receber identidade Google quando `VITE_GOOGLE_CLIENT_ID` estiver configurado e verificar assinatura via `VITE_ORCAOS_ENTITLEMENTS_ENDPOINT`. Pagamento real fica para a proxima camada externa.
O deploy do gate comercial minimo esta documentado em `docs/ai/ORCAOS_COMMERCIAL_GATE_DEPLOYMENT_V1.md`.

## Proxima Decisao

Depois do teste do RC1:

- Se aprovado: preparar beta fechado e pagina/politica de privacidade.
- Se reprovado: abrir lista curta de bloqueadores, corrigir e gerar `0.1.0-rc.2`.
